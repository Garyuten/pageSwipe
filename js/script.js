/* debug
---------------------------------------------------------- */
var debugMode = 0; //デバックモード 1:on, 0: off

/* 初期設定
---------------------------------------------------------- */
var activePage = 0; //現在の表示ページ
var PageNumMax =14;	//全ページ数
var nextPage =0;    //次のページ
var backPage =0;    //直前のページのメモ
var PageDuration = 500;	//ページ切り替えのスピード(1ms)
var FlagAnimation = FlagAnimationA = FlagAnimationB = false; //アニメーション中かの判定用（アニメーション中: true)

var slideC = '#slide1';
var slideR = '#slide2';
var slideL = '#slide3';
var PageC = PageR = PageL = activeTransVal = nextDefTrans = null;

var pW; //ページの移動横幅
var pY; //ページの移動縦幅

var MenuHtml;
//--------------------------------------------------------------

/* useragent
-------------------------------------------------------------- */
var ua_iPhone = false;
var ua_iPad = false;
if(navigator.userAgent.indexOf('iphone') != -1){
  ua_iPhone = true;
}else if(navigator.userAgent.indexOf('iPad') != -1){
  ua_iPad = true;
}


/* feed load (未実装)
-------------------------------------------------------------- */
google.load("feeds", "1");
var FA = new Array( //ここに取得したいRSSフィードを加える
  // "http://hash.city.fukuoka.lg.jp/news/index.rss",
  "http://bulan.co/swings/feed/",
  "http://www.fukuoka-navi.jp/feed/"
);

function initialize() {
  //すべての記事の格納
  var feedsAllArr = new Array();
  //各サイト毎のfeedsの読み込み結果を格納
  var feedsPagesAry = new Array();
  var numEntr = 7; //フィードを読み込む数
  var container = document.getElementById("feed");
  var cnt = FA.length;

  for (var k=0; k<FA.length; k++) {
    var feed = new google.feeds.Feed(FA[k]);
    feed.setNumEntries(numEntr);
    feed.setResultFormat(google.feeds.Feed.JSON_FORMAT); //JSONフォーマットに整形

    feed.load(function(result) {
      // console.log(result);
      if (!result.error) {
        var siteTitle = result.feed.title;
        var feedUrl = result.feed.feedUrl;
        // alert(siteTitle);
        console.log(siteTitle);
        console.log(FA.indexOf(feedUrl));
        pageNo = FA.indexOf(feedUrl)+1;

        for (var i = 0; i < result.feed.entries.length; i++) {

          var entry = result.feed.entries[i];
          var eimg = "";
          // console.log(entry.content);

          var imgCheck = entry.content.match(/(http:){1}[\S_-]+((\.png)|(\.jpg)|(\.JPG)|(\.gif))/); //データを取得する拡張子を指定
          if(imgCheck){
            eimg += imgCheck[0]; //配列の1番目に格納されたデータを取得（つまり、1枚目の画像を取得）
          } else {
            eimg += '/img/dummy.png'; //画像が取得できなかった場合の代替画像のURLを指定
          }

          var ind = feedsAllArr.length;
          feedsAllArr[ind] = new Array();
          feedsAllArr[ind][entry["publishedDate"]] = Date.parse(entry["publishedDate"]); // 日付でソート（並び替え）
          feedsAllArr[ind]["link"] = entry["link"]; // link
          feedsAllArr[ind]["publishedDate"] = entry["publishedDate"]; // publishedDate
          feedsAllArr[ind]["contentSnippet"] = entry["contentSnippet"]; // contentSnippet
          feedsAllArr[ind]["title"] = entry["title"]; // title
          feedsAllArr[ind]["img"] = eimg; // thumbnail

          feedsPagesAry[pageNo] = new Array();
          feedsPagesAry[pageNo][i] = new Array();
          // feedsPagesAry[pageNo][i].push(feedsAllArr[ind]);
          feedsPagesAry[pageNo][i] = feedsAllArr[ind];
          // console.log(feedsAllArr[ind]);
        }

        // HTMLパースした結果をコンテンツに格納
        setHtmlToPage("page"+pageNo, setHtmlTagByFeedEntry(feedsPagesAry[pageNo]));

        console.log(feedsPagesAry);

      }
      // alert(feedsAllArr);
      cnt--;
      //最後のfeedが読み込み終わったら時系列に並べ直す
      if (cnt == 0) {
        feedsAllArr.sort();
        feedsAllArr.reverse();
        var feedAllHtml = setHtmlTagByFeedEntry(feedsAllArr);
        setHtmlToPage("page0", feedAllHtml);
      }

      console.log(feedsPagesAry);
      // console.log(htmlStr);
    });
  }
}
// google.setOnLoadCallback(initialize);

function setHtmlTagByFeedEntry(entries) {
  for (var j = 0; j < entries.length; j++) {
    var pdate = new Date(entries[j]["publishedDate"]);
    var pday = pdate.getDate();
    var pmonth = pdate.getMonth() + 1;
    var pyear = pdate.getFullYear();
    var strdate = pdate.getFullYear() + '/' + (pdate.getMonth() + 1) + '/' + pdate.getDate();

    var htmlStr ="<div class='entry'>"
      +"<a href='" + entries[j]["link"] + "' target='_blank'>"
      +"  <figure><img src='" + entries[j]["img"] + "'></figure>"
      +"  <time>"+strdate+"</time>"
      +"  <h2 class='entry-title'>"+entries[j]["title"]+"</h2>"
      +"  <p class='entry-content'>"+entries[j]["contentSnippet"]+"</p>"
      +"</a>"
      +"</div>";

    return htmlStr;
    // console.log(div);
    // container.appendChild(div);//divfeedへ挿入
  }
}

function setHtmlToPage(pageID,html){
  // alert(pageID);
  $("#" + pageID).html(html);
  if(pageID = "page0"){
    setSlide('#page0');
  }
}


/* preload
-------------------------------------------------------------- */
//==================================================================
//関数：画像のプリロード
(function($) {
  var cache = [];
  // Argumsents are image paths relative to the current page.
  $.preLoadImages = function() {
    var args_len = arguments.length;
    for (var i = args_len; i--;) {
      var cacheImage = document.createElement('img');
      cacheImage.src = arguments[i];
      cache.push(cacheImage);
    }
  }
})(jQuery)

// $.preLoadImages ("images/cover/cover-typo.png", "images/cover/cover.jpg");


/* onload
-------------------------------------------------------------- */

// アドレスバーを非表示にする(iPhoneで有効）
// function doScroll() { if (window.pageYOffset === 0) { window.scrollTo(0,1); } }
// window.addEventListener('load', function () { setTimeout(doScroll, 100); }, false);
// window.onorientationchange = function() { setTimeout(doScroll, 100); };

//jQuery
$(function() {

  //初期化 ---------------------------------------- */
  //デバックモード
  if(debugMode){
    $('body').append('<div id="debug"></div>');　//デバック表示domをbody末尾に追加
  }
  //#content ---------------------------------------- */
  dataSet();

  //イベント定義
  initContent();

  // 高さ揃え
  flatHeightsGroup();

  //PageChange('L','#page5');
  //
  //自動回転の検出
  $(window).bind("resize load",function(){
    resizeFnc();
  })
});


/* #content Init : ダミーデータ生成
-------------------------------------------------------------- */
function dataSet(){
  var num = 20;
  var pageNum = 5;
  var title = Array("フロントエンド カフェ祭りフェス in 福岡 開催",
    "「共に創る」 デザイナーが描く サービスデザインの未来",
    "地元エンジニア厳選！ダイエット中の夜食で食べるべきコスパ最強コンビニ買い物5選！【糖質オフ】",
    "キャンプの必需品・持物まとめ！絶対減らせる荷造りとは",
    "全国一の人口増加率　今、福岡が選ばれている理由とは",
    "今年 vol.47に突入！ ノープラン・ノーガードでお届けするアンカンファレンス勉強会"
  );
  var content = Array("ついに始まった福岡フロントエンド ハッカソン",
    "日本の景気は本当にいいのか？記者が本気でインタビューしてきました",
    "テキストが入るんですよテキストが入るんですよテキストが入るんですよテキストが入るんですよテキストが入るんですよ",
    "テキストが入るんですよテキストが入るんですよテキストが入るんですよテキストが入るんですよテキストが入るんですよ",
    "大切なお知らせです。大切なお知らせです。大切なお知らせです。大切なお知らせです。大切なお知らせです。大切なお知らせです。"
  );

  var color = Array("orange","purple","blue","yellow","green");

  pagesObj = $("#pages");

  var html ="";

  for (var i = 0; i < pageNum; i++) {
    var pageHtml = "";
    for (var j = 0; j < num * Math.floor( Math.random() * 2+1); j++) {
      var no = Math.floor( Math.random() * title.length );
      var no2 = Math.floor( Math.random() * content.length );
      var no3 = Math.floor( Math.random() * color.length );
      pageHtml +="<div class='entry'>"
        // +"<a href='#' target='_blank'>"
        +"<div class='wrap'>"
        +"<div class='wrap-photo'>"
        +"  <figure><img src='img/dummy.png'></figure>"
        +"</div>"
        +"<div class='wrap-text'>"
        +"  <time>"+ "2015/00/00" +"</time>"
        +"  <h2 class='entry-title'>"+title[no]+"</h2>"
        +"  <p class='entry-content'>"+ content[no2]+"</p>"
        +"</div>"
        +"</div>"
        // +"</a>"
        +"</div>";
    }
    html += '<div class="Page" id="page'+i+'"><div class="Wrap '+color[no3]+'" id="slide-page'+i+'"><div class="Content">'
      + pageHtml
      + '</div></div></div>';
  }
  pagesObj.html(html);

  // 暫定 トップページ
  for (var j = 0; j < num*2; j++) {
    var no = Math.floor( Math.random() * title.length );
      pageHtml +="<div class='entry'>"
        // +"<a href='#' target='_blank'>"
        +"<div class='wrap'>"
        +"<div class='wrap-photo'>"
        +"  <figure><img src='img/dummy.png'></figure>"
        +"</div>"
        +"<div class='wrap-text'>"
        +"  <time>"+ "2015/00/00" +"</time>"
        +"  <h2 class='entry-title'>"+title[no]+"</h2>"
        +"  <p class='entry-content'>"+ content[no2]+"</p>"
        +"</div>"
        +"</div>"
        // +"</a>"
        +"</div>";
  }
  $("#slide1 .Wrap .Content").html(pageHtml);

}

/* #content Init
-------------------------------------------------------------- */
function initContent(){
  //全ページ数の取得
  //PageNumMax = $("[data-role='page']").length;
  PageNumMax = $("#pages .Page").length * 1;

  $('.Slide').show();
  nextPage = slideR; //次のスライドの指定
  setSlide('#page0');

  linkArrowShow(); //移動可能な方向のリンク表示

  // tap : タッチが完了した時、押して離すまでの時間が短かった場合に発生するイベント。
  var contentSwipeOptions=
  {
    swipe:contentSwipe,
    allowPageScroll: 'vertical',
    threshold:50
  }
  $('#contents').swipe( contentSwipeOptions );

  function contentSwipe (e , direction , distance){
    //alert('aaa');
    if(!FlagAnimation) {
      //linkArrowHide(); //移動可能な方向のリンクを非表示
      if (direction == 'left') { //swipeleft: 左方向へのスワイプイベント
        dispMsg("左方向へスワイプ！" );
        PageChange('L'); //次ページ(←）
        dispMsgFlg();
      }
      else if (direction == 'right') { // swiperight: 右方向へのスワイプイベント
        dispMsg("右方向へスワイプ！");
        PageChange('R'); //前ページ(→）
        dispMsgFlg();
      }
      else if (direction == 'up') { // swipeup: 上方向へのスワイプイベント
      //dispMsg("上方向へスワイプ！");
      //PageChange('B'); //次ページ↓
      }
      else if (direction == 'down') { // swipedown: 下方向へのスワイプイベント
      //dispMsg("下方向へスワイプ！");
      //PageChange('T'); //前ページ↑
      }
    } else {
      CheckTimer();
    }
  }
  $('#linkLeft').click(function(e){
    if(!FlagAnimation) PageChange('R');
    return false;
  });
  $('#linkRight').click(function(e){
    if(!FlagAnimation) PageChange('L');
    return false;
  });

  //MENU制御------------------------------
  setMenu();

  if( !ua_iPhone && !ua_iPad){
  }
}

//関数：スクロールのイベント追加
document.addEventListener('touchend', function () {
  var top = document.body.scrollTop;
  var height = window.innerHeight;
  var interval = setInterval(function () {
    if (
      top === document.body.scrollTop
      &&
      height === window.innerHeight
      ) {
      clearInterval(interval);
      return $(document).trigger('scrollEnd');
    };
    top = document.body.scrollTop;
    height = window.innerHeight;
  }, 50);
}, false);
$(document).bind('scrollEnd', function () {
  //alert('scroll done');
  if(document.body.scrollTop !== 0) document.body.scrollTop = 0;
  setSlideHeight(); //スライドの高さの変更（アドレスバー有り無しで変わるため）
  setMenuPosition(); //Menu位置の表示
//dispMsgFlg();
});


//関数：ページ移動
// 指定ページに移動
function PageChange(s,pageId) {
  var direction = 1;

  pW = $(slideC).width();

  //ページ移動開始前の状態を設定
  if(pageId) { //初期化・メニューのリンクでのページ遷移
    sTmp = pageId.split('#page');
    pID = sTmp[1]*1; //PageID
    if(activePage == pID) return;
    if(pID > 0 && pID < PageNumMax-1) activePage = pID-1;
    //activePage = sTmp[1]*1-2;
    setSlideR(pID); //ページ指定時はスライド不要なので右スライドセットは不要に
  }

  if(s =='L') { //←
    if(activePage >= PageNumMax-1) return;
    nextPage = slideR;

  } else if (s=='R'){ //→
    if(activePage  <= 0) return;
    direction = -1;
    nextPage = slideL;
  }

  //nextDefTrans = 'translate(' + pW +'px,0)';
  activeTransVal = 'translate(' + (-pW*direction) + 'px,0)';

  //alert('slideR ='+ $(slideR).css('-webkit-transform'));
  //alert('nextPage ='+ $(nextPage).css('-webkit-transform'));

  dispMsgFlg();
  //return;
  //alert('nextPage ='+ nextPage + ', slideL= ' + slideL +', slideC= ' + slideC +', slideR= ' + slideR);

  FlagAnimation = true;
  //CheckTimer();

  //ページ移動

  if(pageId) {	//PageIDの指定の場合（手動CSSでのページスライド）
    CheckTimer();

    //表示中ページを非表示にし、位置を左に動かしておく
    $(slideC).css({
      //'-webkit-transition-duration': PageDuration / 1000 + "s",
      '-webkit-transform-style': "preserve-3d",
      '-webkit-transform': activeTransVal
    }).hide();

    //alert('slideC ='+ $(slideC).css('-webkit-transform'));

    //指定ページをそのまま表示
    $(nextPage).show();
    $(nextPage +' .Wrap .Content').show(); //スライド開始時にコンテンツ表示
    $(nextPage).css({
      //'-webkit-transition-duration': PageDuration / 1000 + "s",
      '-webkit-transition-duration': "0s",
      '-webkit-transform-style': "preserve-3d",
      '-webkit-transform': 'translate(0,0)'
    })
    setTimeout( function() {
      $(nextPage).show();
      $(nextPage +' .Wrap .Content').show();
      FlagAnimation = false; //アニメーション終了
      setSlide(s);
      setMenuPosition(); //MENU位置の再描画
      linkArrowShow();
    }, PageDuration+10);

    //alert('nextPage ='+ $(nextPage).css('-webkit-transform'));

  }
  else {  //通常のフリックでのページ遷移
    //次ページのスライドイン開始
    $( nextPage ).transformAnimator();
    $( nextPage ).transformAnimator('animate',{
      val: "translate(0,0)",
      duration: PageDuration,
      easing: 'ease-out',
      before: function(){
        CheckTimer();
        $(nextPage).show();
        $(nextPage +' .Wrap .Content').show(); //スライド開始時にコンテンツ表示
        FlagAnimationA = true; //アニメーション中に
      },
      after: function(){
        $(nextPage).css({
          '-webkit-transition-duration': "0s",
          '-webkit-transform': 'translate(0,0)'
        })
        dispMsgFlg();
        FlagAnimationA = false;
        if( !FlagAnimationA && !FlagAnimationB ) {
          FlagAnimation = false; //アニメーション終了
        }
        //$('body').scrollTop(0);
        //setMenuPosition(); //Menu位置の表示
        //setSlideHeight(); //スライドの高さの変更（アドレスバー有り無しで変わるため）
        //dispMsgFlg();
      }
    });
    //表示中ページのスライドアウト開始
    $( slideC ).transformAnimator();
    $( slideC ).transformAnimator('animate',{
      val: activeTransVal,
      duration: PageDuration,
      easing: 'ease-out',
      before: function(){
        flatHeightsGroup(); // 高さ揃え
        CheckTimer();
        FlagAnimationB = true; //アニメーション中に
        dispMsgFlg();
      },
      after: function(){
        $( this ).hide();
        FlagAnimationB = false;
        if( !FlagAnimationA && !FlagAnimationB ) {
          FlagAnimation = false; //アニメーション終了
        }
        setSlide(s);
        flatHeightsGroup(); // 高さ揃え

        setMenuPosition(); //MENU位置の再描画
        linkArrowShow();

        dispMsgFlg();
      }
    });
  }
}

// activePageをベースに、L,Rのslideにコンテンツをセットする
function setSlide(s) {
  //スライドの入替
  var c = slideC;

  if(s=='L') { //←
    slideC = slideR;
    slideR = slideL;
    slideL = c;
    if(activePage < PageNumMax-1) activePage++;

  } else if (s=='R'){ //→
    slideC = slideL;
    slideL = slideR;
    slideR = c;
    if(activePage  > 0) activePage--;
  }

  //slideのセット (指定ページのDOM内のHTMLを入れ込む

  //真ん中のスライドは初回のみ挿入（スワイプインしてくるので毎回挿入は不要）
  if(activePage == 0 && PageC == '') {
    $(slideC)
    .css({
      '-webkit-transform-style': "preserve-3d",
      '-webkit-transform': 'translate(0,0)'
    })
    .show();
    $(PageC).clone().prependTo(slideC);

  } else {
    PageC = "#page" + activePage; //念のためのメモ
  }

  //alert('activePage = ' + activePage);

  pW = $('#contents').width();

  /*
     * 右スライド コンテンツ挿入後、スライド位置セット
     */
  if(activePage < PageNumMax) {
    PageR = "#page" + (activePage+1);
    dispMsgFlg();
    $(slideR)
    .css({
      '-webkit-transform-style': "preserve-3d",
      '-webkit-transform': 'translate(' + pW +'px,0)'
    })
    .html($(PageR).html())
    .show()
    // .find('.Wrap .Content').hide();
    ;
    //alert($(slideR).html());
    //alert('slideR ='+ $(slideR).css('-webkit-transform'));
    //alert('slideC ='+ $(slideC).html());
    dispMsgFlg();
  } else {
    $(slideR).empty().hide();
  }
  if(activePage > 0){
    //左スライド コンテンツ挿入後、スライド位置セット
    PageL = "#page" + (activePage*1-1);
    $(slideL)
    .css({
      '-webkit-transform-style': "preserve-3d",
      '-webkit-transform': 'translate(' + (-pW) +'px,0)'
    })
    .html($(PageL).html())
    .show()
    // .find('.Wrap .Content').hide();
    ;
  //$(PageL).clone().prependTo(slideL);
  } else {
    $(slideL).empty().hide();
  }

  // 高さ揃え
  flatHeightsGroup();

  dispMsgFlg();
}

/*
 * メニューのリンクから呼び出された場合、右スライドに指定ページをセットする
 **/
function setSlideR(s) {
  //メニューからのリンクの場合
  if( s && s*1 >= 0) {
    //移動完了なのでMenu指定PageIDの一つ前を指定。これでactivePage-1から[←]スワイプされたと設定
    if(s > 0 && s < PageNumMax-1) activePage = s-1;
  } else {
    return;
  }


  //真ん中、左のスライドは処理不要

  /*
  * 右スライドにメニューの指定ページをセットする
  */
  if(activePage < PageNumMax) {
    PageR = "#page" + s; // ＝ activePageの一つ先のページ
    $(slideR).html($(PageR).html())
    .show()
    .find('.Wrap .Content').hide();
  } else {
    $(slideR).empty().hide();
  }
  //alert('af nextPage =' + $(slideR).css('-webkit-transform'));
  dispMsgFlg();
}


//縦・横回転時の処理
function resizeFnc () {
  //右スライド、左スライドの位置を最調整する
  pW = $('#contents').width();

  $(slideR).css({
    '-webkit-transform': 'translate(' + pW +'px,0)'
  });
  $(slideL).css({
    '-webkit-transform': 'translate(' + (-pW) +'px,0)'
  });
}


//MENU
function setMenu() {
  $('#btnMenu').click(function(e){
    pos = $(this).offset();
    m = $('#menu');
    mc = m.find('.Wrap .Content .ContentWrap');
    mWrap = $('#menu .Wrap');
    mWrapContet = $('#menu .Wrap .Content');
    //ページの移動横幅
    pW = m.width();
    //ページの移動縦幅
    pY = m.height();

    var nextT = 'translate(0,' + pY +'px)';

    //mc.hide();
    //MENU slideup
    mWrap.transformAnimator();
    mWrap.transformAnimator('animate',{
      val: "translate(0,0)",
      duration: PageDuration,
      easing: 'ease-out',
      before: function(){
	$('#footer_nav').hide();
	mWrap.css({
	  '-webkit-transform-style': "preserve-3d"
	})
	.css({
	  '-webkit-transform': nextT
	});

	m.show().height(window.innerHeight);
	mc.show().css('position','static');
	//setMenuLink();
	FlagAnimation = true; //アニメーション中に
      },
      after: function(){
	//スライドの慣性スクロールをOFFに
	$('#contents .Slide .Wrap').css("-webkit-overflow-scrolling","auto");
	//MENUの慣性スクロールをONに
	mWrapContet.css("-webkit-overflow-scrolling","touch");
	FlagAnimation = false;
      }
    });
    return false;
  });
  //MENU slidedown
  $('#btnMenuClose').click(function(e){
    m = $('#menu');
    m.height($('html').height());
    //alert($('html').height()); 356px
    //alert(m.height()); 356px
    mWrap = $('#menu .Wrap');
    mWrapContet = $('#menu .Wrap .Content');
    //ページの移動横幅
    pW = m.width();
    //ページの移動縦幅
    //pY = m.height();
    pY = window.innerHeight;
    var nextT = 'translate(0,' + (pY-36) +'px)';

    //MENU slideup
    mWrap.transformAnimator('animate',{
      val: nextT,
      duration: PageDuration,
      easing: 'ease-out',
      before: function(){
	FlagAnimation = true; //アニメーション中
	//$('#footer_nav').css('position' , 'fixed');
	//MENUの慣性スクロールをOFFに
	mWrapContet.css("-webkit-overflow-scrolling","auto");
      },
      after: function(){
	//m.hide().css('position','relative');
	m.hide();
	//スライドの慣性スクロールをONに
	$('#contents .Slide .Wrap').css("-webkit-overflow-scrolling","touch");
	$('#footer_nav').show();
	setMenuPosition();
	//menuList.html("");
	FlagAnimation = false;
      }
    });
    return false;
  });

  //MENU リンク設定
  setMenuLink();
}
//MENU リンク設定
function setMenuLink () {
  $('#page0 a, #contents_menu li a').click(function(e){
    $('#footer_nav').show();
    $('#menu').hide();
    PageChange("L", $(this).attr('href'));
    $('#contents .Slide .Wrap').css("-webkit-overflow-scrolling","auto").css("-webkit-overflow-scrolling","touch");
    //setMenuPosition();
    e.preventDefault();
    return false;
  });
}

//MENU の表示位置の再描画
function setMenuPosition () {
  //alert("window.innerHeight = "+ window.innerHeight ); //416px ＝Safariバーなし 356px = Safariバーあり
  var M = $('#footer_nav');
  var H = window.innerHeight;
  var disY = 0;
  if(H > 416) {
    disY = 30;
  }
  M.css('bottom', 'none').css('top', H - M.height() - disY );
  M.css('position', 'fixed');
  M.css('position', 'absolute');
//alert("window.innerHeight = " + window.innerHeight + ", css('top') = " + M.css('top') );
}


//スライドの高さの変更（アドレスバー有り無しで変わるため）
function setSlideHeight () {
  ////416px ＝Safariバーなし 356px = Safariバーあり
  var S = $(slideC);
  var M = $('#footer_nav');
  var H = window.innerHeight;

  H = H - M.height();
  //S.css('border','1px solid red');
  S.height(H);

//alert(H +':'+ $(slideC).height() );
}


function dispMsgFlg(s){
  return false;
  if( s == null){
    s="";
  }
  /*
  var slideRT = $(slideR).css('-webkit-transform');
  var slideCT = $(slideC).css('-webkit-transform');
  var slideLT = $(slideL).css('-webkit-transform');
  */
  dispMsg(
    ""
    //+'nextPage:'+nextPage +',<br/ >activePage:'+ activePage + '/' + PageNumMax + 'p'
    //+ '<br/ >FlagAnimation:'+FlagAnimation +', <br/ >FlagAnimationA:'+ FlagAnimationA + ', <br/ >FlagAnimationB:'+ FlagAnimationB
    //+ '<br/ >PageL:'+ PageL +', <br/ >PageC:'+ PageC + ', <br/ >PageR:'+ PageR
    //+ '<br/ >slideL:'+ slideL
    //+ ', <br/ >slideC:'+ slideC
    //+ ', <br/ >slideR:'+ slideR
    //+ '<br/ >slideRT:'+slideRT +', <br/ >slideCT:'+ slideCT + ', <br/ >slideLT:'+ slideLT
    //+ ', <br/ >$("body").scrollTop():'+ $('body').scrollTop()
    //+ ', window.innerHeight:'+window.innerHeight
    //+ ',<br/ >$("html").height:'+ $("html").height()
    //+ ', $("body").height:'+ $("body").height()
    + s
    );
}


var Timer_id;

function CheckTimer() {
  clearTimeout(Timer_id);
  Timer_id = setTimeout("ClearTimer()", 1000);
}

function ClearTimer() {
  if( FlagAnimation || FlagAnimationA || FlagAnimationB) {
    FlagAnimation = FlagAnimationA = FlagAnimationB = false;
    clearTimeout(Timer_id);
    dispMsgFlg('<br />clearTimeout');
  }
}


//==================================================================
//関数：矢印ボタンの制御
var linkArrowAry = {
  'R':"#linkRight",
  'L':"#linkLeft"
};
function linkArrowShow() {
  //現在のページから移動できる方向の矢印のみ表示する
  //linkArrowHideAll();
  //alert( nextPage +':'+ PageNumMax);

  //[→]
  if(activePage < PageNumMax-1) {
    $(linkArrowAry['R']).show();
  } else {
    $(linkArrowAry['R']).hide();
  }
  //[←]
  if( activePage > 0) {
    $(linkArrowAry['L']).show();
  } else {
    $(linkArrowAry['L']).hide();
  }

}
//関数：矢印ボタンを指定方向以外を非表示
function linkArrowHide(s) {
  for ( h in linkArrowAry) {
    if(h != s){ //指定方向以外を消去
      $(linkArrowAry[h]).hide();
    }
  }
}
//関数：矢印ボタンを全非表示
function linkArrowHideAll() {
  for ( h in linkArrowAry) {
    $(linkArrowAry[h]).hide();
  }
}


//==================================================================
//関数：デバック表示用
function dispMsg(str , id ){
  if(debugMode){
    if(id == null ) id='#debug';
    $(id).html(str);
  }
}






// window resize
// ------------------------------------------------

// （スマホ用）画面の向き

var ORIENTATION_LANDSCAPE = 1;
var ORIENTATION_PORTRAIT  = 2;

var orientation = Math.abs(window.orientation) === 90
      ? ORIENTATION_LANDSCAPE : ORIENTATION_PORTRAIT;

if ("onorientationchange" in window) {
  // スマホ・タブレットの場合は、向きが変わった時に
  var _orientation_event;
    if ( navigator.userAgent.indexOf('iPhone') > 0
      || navigator.userAgent.indexOf('iPad') > 0
      || navigator.userAgent.indexOf('iPod') > 0) {
    // iOSの場合は onorientationchange イベントを使う
    _orientation_event = 'orientationchange';
    } else {
    // Androidの場合は resize イベントを使う
    _orientation_event = 'resize';
    }
  $(window).bind(_orientation_event,function(){
      if (Math.abs(window.orientation) === 90) {
    if (orientation!==ORIENTATION_LANDSCAPE){
        // 縦→横になった
        orientation = ORIENTATION_LANDSCAPE;
        resizeEvent();
    }
      }else{
    if (orientation!==ORIENTATION_PORTRAIT){
        // 横→縦になった
        orientation = ORIENTATION_PORTRAIT;
        resizeEvent();
    }
      }
  });
} else {
  // PCの場合はウィンドウのリサイズ時に
  $(window).resize(function(){
    resizeEvent();
  });
}


var w = $(window).width();
var small = 640;
var medium = 992;
var large = 1200;

function resizeEvent() {
  w = $(window).width();
  // 高さ揃え
  flatHeightsGroup();

  if (w <= small) { // small以下

  } else if (w <= medium) { // medium以下

  } else {

  }
}


// 高さをそろえる
function flatHeightsGroup() {
  // return;
  // $('.Content').masonry({
  //   // options
  //   itemSelector: '.entry',
  //   columnWidth: 240
  // });

  w = $(window).width();
  // alert(w);
  // var slc = ".Slide > .Wrap > .Content > .entry"
  $(".Slide").each(function() {

    var slc = "#" + $(this).attr('ID') + " .entry";

    if (w <= small) { // small以下
      $(slc).height("auto");
    } else if (w <= medium) { // medium以下
      setFlatHeights(slc, 3);
    } else {
      setFlatHeights(slc, 4);
    }


    // 画像を全て読み込み終わったら高さ揃えを再実行
    var allImage = $(slc + " img");
    var allImageCount = allImage.length;
    var completeImageCount = 0;

    for(var i = 0; i < allImageCount; i++){
      $(allImage[i]).bind("load", function(){
        completeImageCount ++;
        if (allImageCount == completeImageCount){

          if (w <= small) { // small以下
            $(slc).height("auto");
          } else if (w <= medium) { // medium以下
            setFlatHeights(slc, 3);
          } else {
            setFlatHeights(slc, 4);
          }

        }
      });
    }
  });
}

//指定したカラムレイアウトの高さ調整
function setFlatHeights(selector, col) {
    //初期化
    $(selector).css({
        'height': 'auto'
    });

    var i = 0;
    var slc = ''; //高さを揃える要素のselect文
    var MaxNum = $(selector).length;
    $(selector).each(function() {
        index = $(selector).index(this); //Index Noを取得
        //指定したカラム数か、 最後の要素だったら
        if ((index * 1 + 1) % col == 0 || (index * 1 + 1) == MaxNum) {
            slc += selector + ':eq(' + index + ')';
            $(slc).flatHeights();
            slc = '';
        } else {
            slc += selector + ':eq(' + index + ') ,';
        }
        i++;
    });
}