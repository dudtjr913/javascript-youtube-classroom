import { $ } from '../utils/DOM.js';
import { showSnackbar } from '../utils/snackbar.js';
import { getSavedVideoTemplate } from './layout/storedVideo.js';
import { CLASS_NAME, SNACKBAR_SHOW_TIME } from '../constants.js';

const {
  WATCHING_SECTION,
  WATCHED_SECTION,
  LIKED_SECTION,
  WATCHING,
  WATCHED,
  LIKED,
  NO_WATCHING,
  NO_WATCHED,
  CHECKED,
  NO_LIKED,
} = CLASS_NAME;

export default class ClassroomView {
  constructor() {
    this.selectDOMs();
  }

  selectDOMs() {
    this.$watchingMenuButton = $('.js-watching-menu-button');
    this.$watchedMenuButton = $('.js-watched-menu-button');
    this.$likedMenuButton = $('.js-liked-menu-button');
    this.$savedVideosWrapper = $('.js-saved-videos-wrapper');
    this.$noVideoFound = $('.js-no-video-found');
    this.$snackbarWrapper = $('.js-snackbar-wrapper');
  }

  renderVideosToPrepare(videos) {
    const videosHTML = videos
      .map((video) => getSavedVideoTemplate(video, video.isWatching ? WATCHING : WATCHED))
      .join('');

    this.$savedVideosWrapper.innerHTML = videosHTML;
  }

  renderSavedVideo(video) {
    this.$savedVideosWrapper.insertAdjacentHTML('beforeEnd', getSavedVideoTemplate(video, WATCHING));
  }

  renderImageNoWatchingVideo() {
    this.$noVideoFound.classList.add(NO_WATCHING);
  }

  renderImageNoWatchedVideo() {
    this.$noVideoFound.classList.add(NO_WATCHED);
  }

  renderImageNoLikedVideo() {
    this.$noVideoFound.classList.add(NO_LIKED);
  }

  renderOnlyWatchingVideos() {
    this.setSelectedMenu(this.$watchingMenuButton);
    this.removeAllNoVideoClass();
    this.setSection(WATCHING_SECTION);
  }

  renderOnlyWatchedVideos() {
    this.setSelectedMenu(this.$watchedMenuButton);
    this.removeAllNoVideoClass();
    this.setSection(WATCHED_SECTION);
  }

  renderOnlyLikedVideos() {
    this.setSelectedMenu(this.$likedMenuButton);
    this.removeAllNoVideoClass();
    this.setSection(LIKED_SECTION);
  }

  renderMovedVideo($video, wasWatching) {
    $video.querySelector('.js-check-button').classList.toggle(CHECKED);
    if (wasWatching) {
      $video.classList.remove(WATCHING);
      $video.classList.add(WATCHED);
    } else {
      $video.classList.remove(WATCHED);
      $video.classList.add(WATCHING);
    }
  }

  renderToggleLikedVideo($video) {
    $video.querySelector('.js-like-button').classList.toggle(CHECKED);
    $video.classList.toggle(LIKED);
  }

  setSelectedMenu($selectedMenu) {
    this.$watchingMenuButton.classList.remove('bg-cyan-100');
    this.$watchedMenuButton.classList.remove('bg-cyan-100');
    this.$likedMenuButton.classList.remove('bg-cyan-100');

    $selectedMenu.classList.add('bg-cyan-100');
  }

  setSection(className) {
    this.$savedVideosWrapper.classList.remove(WATCHING_SECTION, WATCHED_SECTION, LIKED_SECTION);
    this.$savedVideosWrapper.classList.add(className);
  }

  removeVideo($video) {
    $video.remove();
  }

  removeAllNoVideoClass() {
    this.$noVideoFound.classList.remove(NO_WATCHING, NO_WATCHED, NO_LIKED);
  }

  renderNotification(message) {
    showSnackbar({ $target: this.$snackbarWrapper, message, showtime: SNACKBAR_SHOW_TIME });
  }
}
