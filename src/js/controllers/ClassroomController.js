import { isWatchingMenu, isWatchingVideo, isLikedVideo, isLikedMenu } from './elementValidator.js';
import { MESSAGE } from '../constants.js';

export default class ClassroomController {
  constructor({ classroomModel, classroomView }) {
    this.view = classroomView;
    this.model = classroomModel;
  }

  init() {
    this.onShowClassroom();
    this.attachEvents();
  }

  attachEvents() {
    this.view.$savedVideosWrapper.addEventListener('click', this.onRequestVideoManagement.bind(this));
    this.view.$watchingMenuButton.addEventListener('click', this.onNavigateWatchingVideos.bind(this));
    this.view.$watchedMenuButton.addEventListener('click', this.onNavigateWatchedVideos.bind(this));
    this.view.$likedMenuButton.addEventListener('click', this.onNavigateLikedVideos.bind(this));
  }

  onShowClassroom() {
    this.view.renderVideosToPrepare(this.model.videos);

    if (isWatchingMenu(this.view.$savedVideosWrapper)) {
      this.showWatchingVideos();
      return;
    }
    this.showWatchedVideos();
  }

  onRequestVideoManagement({ target }) {
    if (!target.classList.contains('video-manage-btn')) {
      return;
    }
    const $video = target.closest('article');
    const isWatching = isWatchingVideo($video);
    const isLiked = isLikedVideo($video);

    if (target.classList.contains('js-check-button')) {
      this.moveVideo($video, isWatching);
      return;
    }

    if (target.classList.contains('js-remove-button')) {
      this.removeVideo($video, isWatching, isLiked);
      return;
    }

    if (target.classList.contains('js-like-button')) {
      this.toggleLikedVideo($video, isLiked);
    }
  }

  onNavigateWatchingVideos() {
    this.showWatchingVideos();
  }

  onNavigateWatchedVideos() {
    this.showWatchedVideos();
  }

  onNavigateLikedVideos() {
    this.showLikedVideos();
  }

  showWatchingVideos() {
    this.view.renderOnlyWatchingVideos();
    this.showImageNoWatchingVideoSaved();
  }

  showWatchedVideos() {
    this.view.renderOnlyWatchedVideos();
    this.showImageNoWatchedVideoSaved();
  }

  showLikedVideos() {
    this.view.renderOnlyLikedVideos();
    this.showImageNoLikedVideoSaved();
  }

  showImageNoWatchingVideoSaved() {
    if (this.model.hasNoWatchingVideoSaved()) {
      this.view.renderImageNoWatchingVideo();
    }
  }

  showImageNoWatchedVideoSaved() {
    if (this.model.hasNoWatchedVideoSaved()) {
      this.model.hasNoWatchingVideoSaved()
        ? this.view.renderImageNoWatchingVideo()
        : this.view.renderImageNoWatchedVideo();
    }
  }

  showImageNoLikedVideoSaved() {
    if (this.model.hasNoLikedVideoSaved()) {
      this.model.hasNoWatchingVideoSaved() && this.model.hasNoWatchedVideoSaved()
        ? this.view.renderImageNoWatchingVideo()
        : this.view.renderImageNoLikedVideo();
    }
  }

  moveVideo($video, isWatching) {
    this.model.moveVideo($video.id);
    this.view.renderMovedVideo($video, isWatching);
    isWatching
      ? this.view.renderNotification(MESSAGE.VIDEO_IS_MOVED_TO_WATCHED_MENU)
      : this.view.renderNotification(MESSAGE.VIDEO_IS_MOVED_TO_WATCHING_MENU);
    this.showImageNoVideo();
  }

  removeVideo($video, isWatching, isLiked) {
    if (!window.confirm(MESSAGE.ARE_YOU_SURE_TO_REMOVE_VIDEO)) return;
    this.model.removeVideo($video.id, isWatching, isLiked);
    this.view.removeVideo($video);
    this.view.renderNotification(MESSAGE.VIDEO_IS_REMOVED_SUCCESSFULLY);
    this.showImageNoVideo();
  }

  toggleLikedVideo($video, isLiked) {
    this.model.toggleLikedVideo($video.id);
    this.view.renderToggleLikedVideo($video);
    isLiked
      ? this.view.renderNotification(MESSAGE.UNCHECK_LIKE_BUTTON)
      : this.view.renderNotification(MESSAGE.CHECK_LIKE_BUTTON);
    isLikedMenu(this.view.$savedVideosWrapper) && this.showImageNoLikedVideoSaved();
  }

  showImageNoVideo() {
    if (isLikedMenu(this.view.$savedVideosWrapper)) {
      this.showImageNoLikedVideoSaved();
      return;
    }

    isWatchingMenu(this.view.$savedVideosWrapper)
      ? this.showImageNoWatchingVideoSaved()
      : this.showImageNoWatchedVideoSaved();
  }
}
