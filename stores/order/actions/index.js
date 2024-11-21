import { orderManagement } from './orderManagement';
import { itemManagement } from './itemManagement';
import { webSocketHandlers } from './webSocketHandlers';

export const actions = {
  ...orderManagement,
  ...itemManagement,
  ...webSocketHandlers
}; 