import {
  setTransitionTarget,
  getTransitionTarget,
} from '@/libs/utils/getTransitionLabel';

export function setPendingRoute(route) {
  setTransitionTarget(route);
}

export function getPendingRoute() {
  return getTransitionTarget();
}
