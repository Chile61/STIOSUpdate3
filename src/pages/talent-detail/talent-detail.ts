import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { Utils } from '../../providers/utils';
import { UserPreview, TalentTopData, RoomLive, RoomLiveStatus } from '../../providers/config';
import { ResponseCode } from '../../providers/network-config';
@Component({
  selector: 'page-talent-detail',
  templateUrl: 'talent-detail.html'
})
export class TalentDetailPage {
  mTalent: UserPreview;
  fans: Array<UserPreview> = [];
  mRoom: RoomLive = new RoomLive();

  constructor(public navCtrl: NavController,
    private navParams: NavParams,
    private mDataService: DataService,
    private events: Events) {
    this.mTalent = <UserPreview>this.navParams.get("talent");
    this.mRoom.talent = this.mTalent;
    this.mRoom.status = RoomLiveStatus.UNDEFINED;
  }

  ionViewDidEnter() {

    this.events.unsubscribe("user:back");
    this.events.subscribe("user:back", () => {
      this.onClickBack();
    });
    this.mDataService.requestGetTalentInfo(this.mTalent.username).then(data => {
      console.log(data);
      this.onTalentInfoResponse(data);
    });

    this.requestTopFan();
  }
  onTalentInfoResponse(data) {
    this.mTalent.money = data.money;
    this.mTalent.point = data.point;
    this.mTalent.level = data.level;
    this.mTalent.phone = data.phone;
    this.mRoom.room_id = data.room_info[0].room_id;
    this.mRoom.poster = data.room_info[0].thumbnail_url;

    this.requestRoomInfo();

  }
  requestRoomInfo() {
    this.mDataService.requestRoomLiveInfo(this.mRoom.room_id).then(data => {
      this.onRoomInfoResponse(data);
    }, error => {
      this.onRoomInfoError();
    });
  }

  onRoomInfoResponse(data) {
    this.mRoom.onResponseRoomLive(data);
  }
  onRoomInfoError() {

  }
  onClickRoomStreaming() {

  }
  
  onClickBack() {
    this.navCtrl.pop();
  }

  getTalentAvatar() {
    return "url(" + this.mTalent.avatar + ")";
  }

  // =============================== for top =======================================



  getLevelColor(level: number) {
    return Utils.getLevelColor(level);
  }

  private requestTopFan() {
    this.mDataService.mNetworkService.requestTalentTop(this.mTalent.username, 0, 3).then(
      data => {
        if (data['status'] == ResponseCode.SUCCESS) {
          this.onTopFanData(data['content']);
        }
      },
      error => {
        this.onRequestTopFanError();
      }
    );
  }

  onRequestTopFanError() {

  }
  onTopFanData(data) {
    this.fans = [];
    for (let user of data) {
      let u = UserPreview.createUser();
      u.username = user.user_name;
      u.name = user.title;
      u.money = user.money;
      u.top_value = user.money_send_gift;
      u.level = user.level;
      u.avatar = user.avatar;
      this.fans.push(u);
    }
  }



  // ======================================================================
}
