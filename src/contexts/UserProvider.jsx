'use client';

// Variable Mapping: l -> nullValue, n -> formatUserProps, i -> identifyPostHog, s -> UserContext, c -> user, d -> setUser, p -> profile, m -> setProfile, y -> loading, f -> setLoading, h -> supabase, K -> fetchUser, v -> updateProfile, g -> refreshProfile, _ -> hasAccess, R -> isAuthenticated
// NOTE: module id: 201220
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client'; // NOTE: module id: 416983
import { analytics, trackRetention } from '@/libs/analytics/posthogAnalytics'; // NOTE: module id: 943348

function nullValue(e) {
  return e === undefined ? null : e;
}

function formatUserProps(e, t = null) {
  let r = e || {};
  return {
    created_at: nullValue(r.created_at || t?.created_at),
    has_access: !!r.has_access,
    is_paying: !!r.has_access,
    plan_name: nullValue(r.plan_name),
    subscription_status: nullValue(r.subscription_status),
    is_lifetime: !!r.is_lifetime,
    is_legacy_user: !!r.is_legacy_user,
    is_partner: !!r.is_partner,
    is_super_admin: !!r.is_super_admin,
    founding_member_since: nullValue(r.founding_member_since),
    current_team_id: nullValue(r.current_team_id),
    onboarding_completed: !!r.onboarding_completed,
    preferred_platform: nullValue(r.preferred_platform),
    ft_source: nullValue(r.ft_source),
    ft_medium: nullValue(r.ft_medium),
    ft_campaign: nullValue(r.ft_campaign),
    ft_channel: nullValue(r.ft_channel),
    ft_at: nullValue(r.ft_at)
  };
}

function identifyPostHog(e, t, r) {
  let a = window.posthog;
  if (!a || typeof a.identify !== "function") return;
  let o = formatUserProps(t, r);
  
  if (typeof a.get_distinct_id === "function" && a.get_distinct_id() === e) {
    if (typeof a.setPersonProperties === "function") {
      a.setPersonProperties(o);
    }
  } else {
    a.identify(e, o);
  }
}

const UserContext = createContext({
  user: null,
  profile: null,
  loading: true,
  hasAccess: false,
  isAuthenticated: false,
  updateProfile: async () => {},
  refreshProfile: async () => {}
});

export function UserProvider({ children, initialUser = null, initialProfile = null }) {
  const [user, setUser] = useState(initialUser);
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  
  const supabase = createClient();

  const fetchUser = async () => {
    try {
      const { data: { user: e }, error: t } = await supabase.auth.getUser();
      if (t || !e) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setUser(e);
      const { data: r } = await supabase.from("users").select("*").eq("id", e.id).single();
      if (r) {
        setProfile(r);
        identifyPostHog(e.id, r, e);
      }
      if (e.created_at) {
        trackRetention(e.id, e.created_at);
      }
      setLoading(false);
    } catch (e) {
      console.error("Error fetching user data:", e);
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    if (!user) return { error: "No user logged in" };
    
    setProfile((t) => ({ ...t, ...e }));
    
    try {
      const { data: t, error: r } = await supabase
        .from("users")
        .update({ ...e, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .select()
        .single();
        
      if (r) throw r;
      
      setProfile(t);
      analytics.user.profileUpdated(Object.keys(e || {}));
      
      if (e && e.theme_preference) {
        analytics.user.themeChanged(e.theme_preference);
      }
      
      if (window.posthog?.setPersonProperties) {
        window.posthog.setPersonProperties(formatUserProps(t, user));
      }
      return { data: t, error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfile(profile); // revert on failure
      return { data: null, error: error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      try {
        const { data: e } = await supabase.from("users").select("*").eq("id", user.id).single();
        if (e) setProfile(e);
      } catch (e) {
        console.error("Error refreshing profile:", e);
      }
    }
  };

  useEffect(() => {
    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (e, t) => {
      if (e === "SIGNED_IN") {
        let provider;
        (function(userId, authProvider) {
          if (userId) {
            try {
              let key = `anm_signed_in:${userId}`;
              if (sessionStorage.getItem(key)) return;
              sessionStorage.setItem(key, "1");
            } catch (e) {}
            analytics.user.signedIn(authProvider);
          }
        })(t?.user?.id, (provider = t?.user?.app_metadata?.provider) && provider !== "email" ? provider : "magic_link");
        
        fetchUser();
      } else if (e === "TOKEN_REFRESHED") {
        fetchUser();
      } else if (e === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        try {
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            let key = sessionStorage.key(i);
            if (key && key.startsWith("anm_signed_in:")) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) {}
        analytics.user.signedOut();
        analytics.reset();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    
    const channel = supabase.channel(`user_profile_${user.id}`).on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "users",
      filter: `id=eq.${user.id}`
    }, (e) => {
      setProfile(e.new);
      identifyPostHog(user.id, e.new, user);
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  const hasAccess = !loading && (profile?.has_access || false);
  const isAuthenticated = !loading && !!user;

  return (
    <UserContext.Provider value={{ user, profile, loading, hasAccess, isAuthenticated, updateProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw Error("useUser must be used within a UserProvider");
  }
  return context;
};

