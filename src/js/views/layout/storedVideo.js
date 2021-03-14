import { YOUTUBE_LINK_ENDPOINT, CLASS_NAME } from '../../constants.js';

export const getSavedVideoTemplate = (
  { videoId, videoTitle, channelId, channelTitle, publishedAt, isLiked },
  className,
) => {
  const { WATCHING, CHECKED, LIKED } = CLASS_NAME;

  return `
    <article id=${videoId} class="${className} ${isLiked ? LIKED : ''} clip">
      <div class="preview-container">
        <iframe
          width="100%"
          height="118"
          src=${YOUTUBE_LINK_ENDPOINT.VIDEO}${videoId}
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
      <div class="content-container pt-2 px-1">
        <h3 class="js-video-title video-title">${videoTitle}</h3>
        <div class="channel-title">
          <a href=${
            YOUTUBE_LINK_ENDPOINT.CHANNEL
          }${channelId} target="_blank" rel="noopener" class="channel-link mt-1 ">
          ${channelTitle}
          </a>
        </div>
        <div class="published-at">${publishedAt}</div>
        <div>
          <span class="js-check-button video-manage-btn ${className === WATCHING ? '' : CHECKED}">✅</span>
          <span class="js-like-button video-manage-btn ${isLiked ? CHECKED : ''}">👍</span>
          <span class="js-comment-button video-manage-btn disabled">💬</span>
          <span class="js-remove-button video-manage-btn">🗑️</span>
        </div>
      </div>
    </article>
  `;
};
