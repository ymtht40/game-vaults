'use client';

import {
  ChartLine,
  ChartLineUp,
  Check,
  CurrencyEur,
  DotsThree,
  List,
  Minus,
  Percent,
  Plus,
  X,
} from '@phosphor-icons/react';

function createBoldIcon(Icon) {
  return function BoldIcon(props) {
    return <Icon weight="bold" aria-hidden="true" {...props} />;
  };
}

export const PlusIcon = createBoldIcon(Plus);
export const MinusIcon = createBoldIcon(Minus);
export const CheckIcon = createBoldIcon(Check);
export const XIcon = createBoldIcon(X);
export const ListIcon = createBoldIcon(List);
export const DotsThreeIcon = createBoldIcon(DotsThree);
export const PercentIcon = createBoldIcon(Percent);
export const CurrencyEurIcon = createBoldIcon(CurrencyEur);
export const ChartLineIcon = createBoldIcon(ChartLine);
export const ChartLineUpIcon = createBoldIcon(ChartLineUp);
