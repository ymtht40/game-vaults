import {
  setTransitionTarget,
  getTransitionTarget,
} from '@/libs/config/getTransitionLabel';

export function setPendingRoute(route) {
  setTransitionTarget(route);
}

export function getPendingRoute() {
  return getTransitionTarget();
}
