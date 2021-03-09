import {
  MAX_RECENT_KEYWORD_COUNT,
  MAX_RESULT_COUNT,
  MAX_VIDEO_STORAGE_CAPACITY,
  STORAGE_CAPACITY_IS_FULL,
  KEY_VIDEOS_WATCHING,
  VIDEO_IS_SAVED_SUCCESSFULLY,
  API_SEARCH_ENDPOINT,
  PART_TYPE,
  SEARCH_TYPE_VIDEO,
  REGION_CODE,
} from '../../src/js/constants.js';
import { getListFromLocalStorage } from '../../src/js/utils/localStorage.js';

const interceptYoutubeApiRequest = (keyword, alias) => {
  cy.intercept({
    url: `${API_SEARCH_ENDPOINT}?`,
    query: {
      part: PART_TYPE,
      q: keyword,
      type: SEARCH_TYPE_VIDEO,
      maxResults: MAX_RESULT_COUNT.toString(),
      regionCode: REGION_CODE,
    },
  }).as(alias);
};

describe('검색 모달 테스트', () => {
  const KEYWORD = '테코톡';
  const INTERCEPT_ALIAS = 'search';

  beforeEach(() => {
    cy.visit('http://localhost:5500/');
  });

  it('검색 모달에서 "엔터키"를 누르면, 최초 검색 결과 10개가 화면에 표시된다.', () => {
    interceptYoutubeApiRequest(KEYWORD, INTERCEPT_ALIAS);
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD).type('{enter}');
    cy.wait(`@${INTERCEPT_ALIAS}`);

    cy.get('.search-result-group').children().should('have.length', MAX_RESULT_COUNT);
  });

  it('검색 모달에서 "검색 버튼"을 클릭하면, 최초 검색 결과 10개가 화면에 표시된다.', () => {
    interceptYoutubeApiRequest(KEYWORD, INTERCEPT_ALIAS);
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD);
    cy.get('.js-search-keyword-button').click();
    cy.wait(`@${INTERCEPT_ALIAS}`);

    cy.get('.search-result-group').children().should('have.length', MAX_RESULT_COUNT);
  });

  it('검색 키워드 제출 후, 데이터를 불러오기 전이면 skeleton UI가 화면에 표시된다.', () => {
    const ANOTHER_KEYWORD = '우아한 형제들';

    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(ANOTHER_KEYWORD);
    cy.get('.js-search-keyword-form').submit();

    cy.get('.search-result-group').should('have.class', 'skeleton');
    cy.get('.js-modal .video-title').each(($el) => cy.wrap($el).should('have.class', 'line'));
    cy.get('.js-modal .channel-title').each(($el) => cy.wrap($el).should('have.class', 'line'));
    cy.get('.js-modal .published-at').each(($el) => cy.wrap($el).should('have.class', 'line'));
    cy.get('.js-modal .preview-container').each(($el) => cy.wrap($el).should('have.class', 'image'));
  });

  it('검색결과가 없는 경우, 결과없음 이미지가 화면에 표시된다.', () => {
    const KEYWORD_FOR_NO_RESULT = 'dsflmkfsdlkjweljksf';

    interceptYoutubeApiRequest(KEYWORD_FOR_NO_RESULT, INTERCEPT_ALIAS);
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD_FOR_NO_RESULT);
    cy.get('.js-search-keyword-form').submit();
    cy.wait(`@${INTERCEPT_ALIAS}`);

    cy.get('#search-result-wrapper').find('img').should('have.attr', 'src').should('include', 'not_found');
  });

  it('스크롤바를 최하단으로 이동시킬 경우, 다음 10개 아이템을 추가로 화면에 표시한다.', () => {
    interceptYoutubeApiRequest(KEYWORD, INTERCEPT_ALIAS);
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD);
    cy.get('.js-search-keyword-form').submit();
    cy.wait(`@${INTERCEPT_ALIAS}`);

    cy.get('#search-result-wrapper').scrollTo('bottom');
    cy.get('.js-modal article').should('have.length', MAX_RESULT_COUNT * 2);
  });

  it('저장버튼을 누르면 localStorage에 해당 영상이 저장된다.', () => {
    const FIRST_INDEX = 0;

    interceptYoutubeApiRequest(KEYWORD, INTERCEPT_ALIAS);
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD);
    cy.get('.js-search-keyword-form').submit();
    cy.wait(`@${INTERCEPT_ALIAS}`);

    localStorage.setItem('test', ['test']);
    cy.get('.save-button')
      .eq(FIRST_INDEX)
      .click()
      .then(($el) => {
        const list = JSON.parse(getListFromLocalStorage(KEY_VIDEOS_WATCHING));
        cy.wrap($el).should('have.id', list[FIRST_INDEX].videoId);
      });
  });

  it('검색 모달에 다시 접근했을 때, 가장 마지막에 검색한 결과를 화면에 표시한다.', () => {
    interceptYoutubeApiRequest(KEYWORD, INTERCEPT_ALIAS);
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD);
    cy.get('.js-search-keyword-form').submit();
    cy.wait(`@${INTERCEPT_ALIAS}`);
    cy.reload();

    cy.get('.js-search-button').click();
    cy.get('.js-recent-keyword').children(0).should('have.text', KEYWORD);
    cy.get('.js-modal article').should('have.length', MAX_RESULT_COUNT);
  });

  it('키워드 4개를 연속해서 검색했을 때, 최근 검색키워드 3개를 검색창 하단에 보여준다.', () => {
    const KEYWORDS = ['쿠팡', '네이버', '토스', '우아한형제들'];
    const TRY_COUNT = KEYWORDS.length;

    cy.get('.js-search-button').click();
    KEYWORDS.forEach((keyword) => {
      interceptYoutubeApiRequest(keyword, `${INTERCEPT_ALIAS}-${keyword}`);
      cy.get('.js-search-keyword-input').clear().type(keyword);
      cy.get('.js-search-keyword-form').submit();
      cy.wait(`@${INTERCEPT_ALIAS}-${keyword}`);
    });

    cy.get('.js-recent-keyword')
      .children()
      .should('have.length', MAX_RECENT_KEYWORD_COUNT)
      .each(($el, i) => {
        cy.wrap($el).should('have.text', KEYWORDS[TRY_COUNT - 1 - i]);
      });
  });
});

describe('예외 처리 테스트', () => {
  const KEYWORD = 'javascript';

  beforeEach(() => {
    cy.visit('http://localhost:5500/');
  });

  it('100개의 영상을 저장했을 때, 더 저장하려고 시도할 경우 저장용량 초과 메세지를 표시한다.', () => {
    cy.get('.js-search-button').click();
    cy.get('.js-search-keyword-input').type(KEYWORD);
    cy.get('.js-search-keyword-form').submit();

    interceptYoutubeApiRequest(KEYWORD);
    for (let i = 0; i < 10; i++) {
      cy.get('.modal').scrollTo('bottom');
      cy.wait('@search');
    }
    cy.get('.save-button').each(($el, i) => {
      if (i >= MAX_VIDEO_STORAGE_CAPACITY) {
        $el.click();
        cy.wrap($el).should(be.visible);
        cy.get('.js-snackbar').contains(STORAGE_CAPACITY_IS_FULL);
        return;
      }
      $el.click();
      cy.get('.js-snackbar').contains(VIDEO_IS_SAVED_SUCCESSFULLY);
    });
  });
});
