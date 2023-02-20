export class ReservationModel {
  public id: number;
  public userId: number;
  public resourceId: number;
  public quantity: number;
  public fromDate: string;
  public toDate: string;
  public status: string;
  public resourceName: string;
  public user: string;
}
