export interface IBlockResponse {
  id: string;
  locationId: string;
  blockName: string;
  totalSlots: number;
  availableSlots: number;
  isFull: boolean;
}
