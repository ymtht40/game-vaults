// Variable Mapping: i -> pendingRoute, u -> setPendingRoute, y -> setPendingRoute, K -> getPendingRoute

let pendingRoute = null;

// NOTE: module id: 842365
export function setPendingRoute(route) {
  pendingRoute = route || null;
}

export function getPendingRoute() {
  return pendingRoute;
}

