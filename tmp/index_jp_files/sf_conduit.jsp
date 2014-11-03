









if( superfish ){
}else{
    if( window == top ){
       if( window.location.href.indexOf( "amazon.com/" ) > 0 && window.location.href.indexOf( "/search/" ) > 0 && window.location.href.indexOf( "#sf" ) > 0 ){
            window.location.replace( window.location.href.substring( 0, window.location.href.indexOf( "#sf" ) ) );
       }
        spsupport = {};
        spsupport.br = { isIE7: 0};
        spsupport.log = function( m ){
            if( window.console ){
                console.log( m );
            }
        };
        
        spsupport.whiteStage = {
    st: 0,
    rv: 0,
    suff: ['com'],
    bl: 'facebook.youtube.baidu.linkedin.qq.microsoft.flickr.msn.lolhehehe.bedandbreakfast.wired.yankodesign.dcinside.booking.crunchyroll.westsiderentals.politico.',
    html: '',

    isDomain: function(){
        var d = spsupport.api.getDomain().toLowerCase().split('.');
        if (this.bl.indexOf(d[0]+'.') == -1) {
            for (var i in this.suff) {
                if (d[d.length-1] == this.suff[i]) {
                    return 1;
                }
            }
        }
        return 0;
    },

    isStore: function(){
        if (!this.isDomain()) {
            return 0;
        }

        this.html = sufio.body().innerHTML;
        var e = this.html.match(/[éüöó]/gi);
        if (e && e.length > 40) {
            return 0;
        }

        var c = this.html.match(/(add\s?to\s?(my)?\s?(shopping)?\s?(cart|bag|basket|order))|free shipping|shop now|(my|your|view) cart|shopping (cart|bag)|wish\s?list/ig);
        var d = this.html.match(/\$\s?(<[^>]+>)?([0-9]+\,)?[0-9]+\.?[0-9]+/ig);

        if (c && d) {
            return 1;
        }
        return 0;
    },

    isReview: function() {
        if (!this.isDomain()) {
            return 0;
        }
        this.txt = sufio.body().innerText;
        this.txt = this.txt ? this.txt : sufio.body().textContent;
        if(this.txt.match(/\$/) && this.txt.match(/price|review/)) {
            return 1;
        }
        return 0;
    }
}


        spsupport.sites = {
    rules: function(){
        var site = spsupport.api.getDomain();
        site = site.substr(0, site.indexOf(".")).replace(/-/g, "_");
        return eval( "spsupport.sites._" + site);
    },

    isBlackStage: function() {
        var r = this.rules();
        if( r && r.isBlackStage ){
            return r.isBlackStage();
        }
        return false;
    },

    care : function(){
        var r = this.rules();
        if( r && r.care ){
            r.care();
        }
    },

    validRefState : function(){ // Valid Refresh State
        var r = this.rules();
        if( r && r.validRefState ){
            return r.validRefState();
        }
        return 1;
    },

    vImgURL : function( iU ){ // Validate IMG URL
        var r = this.rules();
        if( r && r.vImgURL ){
            return r.vImgURL( iU );
        }
        return ( iU );
    },

    preInject : function(){
        var r = this.rules();
        if( r && r.preInject ){
            r.preInject();
        }
    },

    validProdImg : function(){
        var r = this.rules();
        if( r && r.validProdImg ){
            return r.validProdImg();
        }
        return 0;
    },

    imgSupported : function( img ){
        var r = this.rules();
        if( r && r.imgSupported ){
            return r.imgSupported( img );
        }
        return 1;
    },

    ph2bi : function(){ // Plugin have to be injected
        var r = this.rules();
        if( r && r.ph2bi ){
            return r.ph2bi();
        }
        return 0;
    },

    gRD : function(){ // Get Refresh Delay
        var r = this.rules();
        if( r && r.gRD ){
            return r.gRD();
        }
        return 500;
    },

    gFU : function(){ // Get favicon URL
        var r = this.rules();
        if( r && r.gFU ){
            return r.gFU();
        }
        return( "http://www." +  spsupport.api.getDomain() + "/favicon.ico?p=" + new Date().getTime() );
    },

    gVI : function(){ // get Images Node
        var r = this.rules();
        if( r && r.gINode ){
            return r.gVI();
        }
        return 0;
    },

    inURL : function( u ){
        return ( window.location.href.indexOf( u ) > -1);
    },

    sgGen: function() {
        spsupport.p.iSpin = new Image();
        spsupport.p.iSpin.src = spsupport.p.imgPath + 'loading.gif';
    },

    getRelText : function(node){
        var relTxt = {
            prodUrl: "",
            iText: ""
        };
        var spa = spsupport.api;
        if (node) {
            var r = this.rules();
            if( r && r.getRelText ){
                return r.getRelText(node, relTxt);
            }
            var lNode = spa.getLinkNode(node, 3);
            if (lNode) {
                var txt = spa.textFromLink(lNode, lNode.href);
                relTxt = {
                    prodUrl : lNode.href,
                    iText : txt
                };
            }
        }
        return relTxt;
    },

    killSU : function() {
        try{
            var sfPP = spsupport.p.prodPage;
            sfPP.reset();
            var bC = sufio.byId("SF_SLIDE_UP_CLOSE");
            if( bC ){
                sufio.attr( bC, "upp", 0 );
                superfish.b.closePSU( bC, 4 );
            }
        }catch(ex){}        
    },
    
    srpSU : function(){
        var r = this.rules();
        if( r && r.srpSU ){
            return r.srpSU();
        }
        return( 1 );
    },
    
    
    _google : {

        isBlackStage: function() {
            if(window.sufio && sufio.isIE < 8) {
                return true;
            }
            return false;
        },

        vQ: 'li[id = "productbox",li[class = "g knavi"]',

        care : function(){
            this.searchget();
            try{
                sufio.require("dojo.hash");
                sufio.addOnLoad(function(){
                    sufio.subscribe("/dojo/hashchange", null,  function(){
                        spsupport.api.killIcons();
                        var me = spsupport.sites._google;
                        me.killSU();
                        me.killSg();
                        me.vIcons();
                    } );
                });
            }catch(e){
            }

            var db = sufio.body();
            if( db && !db.evAdded ){
                sufio.connect(
                db,
                "onkeydown", function(e){
                    var ch;
                    if(e && e.which){
                        ch = e.which;
                    }else if( window.event ){
                        ch = window.event.keyCode;
                    }

                    if(ch != 45 && ch != 17) {
                        spsupport.api.killIcons();
                        spsupport.sites._google.killSU();
                    }
                    if(ch == 13) {
                        spsupport.sites._google.killSg();
                        spsupport.sites._google.vIcons();
                    }
                });
                db.evAdded = 1;
            }
        },

        searchget: function() {
            var iu = spsupport.sites.inURL;
            var ssg = superfish.sg;
            if ( superfish.b.searchget && ssg ) {
                superfish.b.multiImg = 1;
                superfish.publisher.limit = superfish.b.searchget;
                ssg.q = this.vQ;
                ssg.cookie = '_google';
                if (ssg.q.length) {
                    ssg.sSite = 8;
                    ssg.offset = 1;
                    ssg.cssTitle = 'display:block;padding-top: 3px;max-height:48px; overflow: hidden;';
                    ssg.cssPrice = 'font-weight: bold;';
                    ssg.cssStore = 'display:block; color:#0E774A;text-decoration: none; width: 90px; overflow: hidden;line-height:15px;';
                    ssg.cssPrompt = 'top: 20px; right: -37px;';
                }
                if (iu("products/catalog")) {
                    ssg.sSite = 0;
                    //                    ssg.sSite = 4;
                    //                    ssg.q = '[id="product-basic-info"]';
                    //                    ssg.offset = 0;
                    //                    ssg.powered1 = 'by&nbsp;';
                    //                    ssg.cssMain = 'width: 214px;float: right;top: -323px; height:1px; overflow: visible;';
                    //                    ssg.cssMainTitle = 'color:#009900;font-size:12px;font-family: Arial,sans-serif;';
                    //                    ssg.cssPowered = ssg.cssMainTitle;
                    //                    ssg.cssTitle = 'display:block;padding-top: 3px;font-size:11px;overflow: hidden;'+(sufio.isIE ? "height:29px;" : "max-height: 28px;");
                    //                    ssg.cssPrice = 'padding-top: 2px;font-size:11px;';
                    //                    ssg.cssStore = 'display:block;font-size:11px;height:14px; overflow: hidden;color:#0E774A;';
                    //                    ssg.cssPrompt = 'right:-3px; top:14px;';
                }
                else if (iu("books.google") ||  iu( "tbs=shop" ) || iu( "tbm=shop" ) || iu( "tbs=bks" ) || iu("tbm=bks") ) {
                    ssg.sSite = 0; /* to enable slide-up instead of searchget */
                    // superfish.publisher.limit = 0; /* not to send the request */
                }
                spsupport.sites.sgGen();
            }
        },

        gVI : function (){
            var iu = spsupport.sites.inURL;
            return ( (iu("books.google" ) || iu("tbm=bks") || iu("tbs=bks") ) ? 0 : sufio.query('img[class *= "productthumb"]') );
        },

        vIcons : function(){
            var ssg = superfish.sg;
            setTimeout(
            function(){
                var ss = spsupport.sites;
                var sa = spsupport.api;
                var iu = ss.inURL;
                var im = ss._google.gVI();
                superfish.publisher.imgs = [];
                superfish.publisher.reqCount = 0;
                if( sufio.query( ss._google.vQ ).length > 0 ){
                    ssg.sSite = 8;
                    if( im.length > 0 ){
                        sa.startDOMEnumeration();
                        setTimeout( function(){
                            sa.wRefresh( 300 );
                        }, 800 );
                    }
                }
                else {
                    ssg.sSite = 0;
                    if( iu("tbs=shop") ||  iu("tbm=shop") ){
                        // ssg.sSite = 0;
                        sa.startDOMEnumeration();
                        setTimeout( function(){
                            sa.wRefresh( 350 );
                        }, 800 );
                    }
                    else if(  iu("books.google") || iu("tbs=bks") || iu("tbm=bks")) {
                        // ssg.sSite = 0;
                        sa.startDOMEnumeration();
                        setTimeout( function(){
                            sa.wRefresh( 350 );
                        }, 800 );
                    }
                }
            }, 1400 );
        },

        ph2bi : function(){
            return 1;
        },

        validRefState : function(){
            var iu = spsupport.sites.inURL;
            return  ( ( sufio.query('li[id = "productbox"]').length > 0
                && sufio.query('img[class *= "productthumb"]').length > 0 )
                || sufio.query('li[class = "g knavi"]').length > 0
                || iu("tbs=shop")
                || iu("tbm=shop")
                || iu("products/catalog" )
                || iu("books.google" )
                || iu("tbm=bks")
                || iu("tbs=bks")
        );
        },

        preInject : function(){
            var iu = spsupport.sites.inURL;
            var sIU = spsupport.p.supportedImageURLs;
            if ( sIU ){
                sIU[ sIU.length ] = "jpg;base64";
                sIU[ sIU.length ] = "jpeg;base64";
            }else{
                sIU = [ "jpg;base64", "jpeg;base64" ];
            }

            if( iu("books.google" ) ){
                var wN = sufio.query('div[id *= "_sliders"]')
                if( wN.length > 0  ){
                    sufio.forEach( wN,function( n ) {
                        spsupport.domHelper.addEListener( n, spsupport.api.onDOMSubtreeModified, "DOMSubtreeModified");
                    });
                }
            }
        },

        validProdImg : function(){
            if( sufio.query( this.vQ ).length > 0  && !this.prodImg ){
                this.prodImg = 1;
                return 1;
            }
            return 0;
        },

        imgSupported : function( im ){
            if( im.id && im.id.indexOf("vidthumb")> -1 ||
                im.className.indexOf("vidthumb") > -1 ||
                im.className.indexOf("imgthumb") > -1 ){
                return 0;
            }
            return 1;
        },

        killSU : function(){
            this.prodImg = 0;
            spsupport.sites.killSU();
        },
   
        killSg : function(){
            if (superfish.sg) {
                superfish.sg.close();
            }
        },

        gFU : function(){ // Get favicon URL
            var src = "http://www." +  spsupport.api.getDomain() + superfish.util.slasher + "favicon.ico";
            superfish.util.slasher += '/';
            return src;
        },

        getRelText : function(node, relTxt){
            if (node) {
                var spa = spsupport.api;
                var lNode = spa.getLinkNode(node, 3);
                if (lNode) {
                    var url = lNode.href;
                    var pUrl = "";

                    if( url.indexOf( "javascript" ) == -1 ){
                        if( url.indexOf("http://www.google.com/url?") > -1 ){
                            var pSign = url.indexOf("=");
                            if( pSign > -1 ){
                                url = url.substr( pSign + 1, url.length );
                            }
                        }
                        try{
                            url = decodeURIComponent( url );
                        }catch(e){
                            // not encoded
                        }
                        var prm = url.indexOf("&");
                        if( prm > -1 ){
                            url = pUrl = url.substr(0, prm);
                        }
                        var sec = node;
                        for (var i = 0; i < 20; i++) {
                            sec = sec.parentNode;
                            var cl = sec.getAttribute('class');
                            if (cl && cl.indexOf('knavi') > -1 || sec.nodeName == 'body') {
                                break;
                            }
                        }
                        var txt = spa.textFromLink(lNode, url, sec, 1);
                    }
                    relTxt = {
                        prodUrl : ( pUrl != "" ? pUrl : lNode.href ),
                        iText : txt
                    };
                }
            }
            return relTxt;
        },
        
        srpSU : function(){
            return( 0 );
        }
    },


    _thefind : {
        care : function(){
            if( !spsupport.br.isIE7 ){
                try{
                    sufio.require("dojo.hash");
                    sufio.addOnLoad(function(){
                        sufio.subscribe("/dojo/hashchange", null,  function(){
                            spsupport.api.killIcons();
                            spsupport.sites.killSU();
                            setTimeout( function(){
                                spsupport.p.prodPage.reset();
                                spsupport.p.SRP.reset();
                                spsupport.api.startDOMEnumeration();
                            }, 3500 );
                            setTimeout( function(){
                                spsupport.api.wRefresh( 700 );
                            }, 4400 );
                        } );
                    });
                }catch(e){
                }
            }
        }
    },


    _macys : {
        care : function(){
            setTimeout( function(){
                spsupport.sites._macys.paging();
            }, 1000 );

            this.urlChange();
        },

        urlChange : function(){
            if( !spsupport.br.isIE7 && spsupport.sites.inURL( "productsPerPage" ) ){
                try{
                    sufio.require("dojo.hash");
                    sufio.addOnLoad(function(){
                        setTimeout( function(){
                            spsupport.api.wRefresh( 300 );
                        }, 2000 );
                        setTimeout( function(){
                            spsupport.sites._macys.paging();
                        }, 1500 );
                        sufio.subscribe("/dojo/hashchange", null,  function(){
                            if( !spsupport.sites._macys.evtc ){
                                spsupport.api.killIcons();
                                spsupport.sites.killSU();
                                setTimeout( function(){
                                    spsupport.p.prodPage.reset();
                                    spsupport.p.SRP.reset();
                                    spsupport.api.startDOMEnumeration();
                                }, 1700 );
                                setTimeout( function(){
                                    spsupport.api.wRefresh( 300 );
                                }, 2700 );
                                setTimeout( function(){
                                    spsupport.sites._macys.paging();
                                }, 3500 );
                            }
                        } );
                    });
                }catch(e){
                }
            }
        },

        paging : function(){
            var pgn = sufio.query('.paginationSpacer');
            if( pgn.length > 0 ){
                setTimeout(
                function(){
                    sufio.forEach(
                    pgn,
                    function( lnk ) {
                        var tDel = 1500;
                        sufio.connect( lnk, "onmouseup", function(){
                            spsupport.api.killIcons();
                            spsupport.sites._macys.evtc = 1;
                            setTimeout( function(){
                                spsupport.api.startDOMEnumeration();
                            }, tDel );
                            setTimeout( function(){
                                spsupport.api.wRefresh( tDel / 3 );
                            },  tDel * 2 );
                            setTimeout( function(){
                                spsupport.sites._macys.paging();
                            }, tDel * 2.5 );
                        } );
                    });
                }, 1400);
                this.evtc = 0;
            }
        }
    },


    _yahoo : {
        vImgURL : function( u ){
            var uD = u.split( "http" );
            if( uD.length > 2 ){
                uD = uD[ 2 ];
            }else if( uD.length == 2){
                uD = uD[ 1 ];
            }else{
                uD = uD[ 0 ];
            }
            uD = uD.split( "&" );
            uD = uD[ 0 ];
            return "http" + uD;
        },

        validProdImg : function(){
            return 1;
        }
    },

    //    _boscovs :{
    //        vImgURL : function( u ){
    //            return u.split(";")[0];
    //        }
    //    },

    _amazon : {
        care : function(){
            this.searchget();
            this.foxlingo();
            this.paging();
            this.widget();
            this.urlChange();
        },

        searchget: function() {
            var ssg = superfish.sg;
            if (ssg && superfish.b.searchget) {
                ssg.sSite = 4;
                ssg.q = '[id="buyboxDivId"]';
                ssg.relpos = 'before';
                ssg.lines = 2;
                ssg.powered1 = 'by&nbsp;';
                var st = 'font-size:11px;font-family: Arial,sans-serif;';
                ssg.cssMainTitle = 'color:#000000;' + st ;
                ssg.cssPowered = 'text-align:right;color:#009900;' + st;
                ssg.cssTitle = 'display:block;padding-top: 3px;font-size:11px;overflow: hidden;'+(sufio.isIE ? "height:30px;" : "max-height: 28px;");
                ssg.cssPrice = 'padding-top: 2px;font-size:11px;';
                ssg.cssStore = 'display:block;font-size:11px;height:14px; overflow: hidden;color:#0E774A;';
                ssg.cookie = '_amazon';
                spsupport.sites.sgGen();
            }
        },

        gRD : function(){
            return 1300;
        },

        foxlingo : function(){
            if( !sufio.isIE &&
                spsupport.p.dlsource == "foxlingo" ){
                superfish.b.inj( superfish.b.site + "json/currencyRate.json?d=" + spsupport.api.getDateFormated(), 1, 1,
                function(){
                    superfish.b.currency.addCurrency('$', superfish.b.curRequested )
                } );
            }
        },
        paging : function(){
            var pgn = sufio.query('.pagnLink, .pagnPrev, .pagnNext, a[href *= "#/ref"]');
            if( pgn.length > 0 ){
                setTimeout(
                function(){
                    sufio.forEach(
                    pgn,
                    function( lnk ) {
                        var tDel = 900;
                        sufio.connect( lnk, "onmouseup",
                        function(){
                            if ( !spsupport.sites._amazon.evCatch ){
                                spsupport.sites._amazon.evCatch = 1;
                                spsupport.api.wRefresh( tDel/1.3 );
                                setTimeout( "spsupport.sites._amazon.paging(); spsupport.sites._amazon.evCatch = 0;", tDel * 3 );
                            }
                        } );
                    });
                }, 1400);
            }
        },

        urlChange : function (){
            if( !spsupport.br.isIE7 ){
                try{
                    sufio.require("dojo.hash");
                    sufio.addOnLoad(function(){
                        sufio.subscribe("/dojo/hashchange", null,
                        function(){
                            if ( !spsupport.sites._amazon.evCatch ){
                                spsupport.sites._amazon.evCatch = 1;
                                    spsupport.sites.killSU();
                                spsupport.api.killIcons();
                                setTimeout( function(){
                                        spsupport.p.prodPage.reset();
                                        spsupport.p.SRP.reset();
                                    spsupport.api.startDOMEnumeration();
                                }, 1900 );
                                setTimeout( function(){
                                    spsupport.sites._amazon.paging();
                                    spsupport.api.wRefresh( 400 );
                                    spsupport.sites._amazon.evCatch = 0;
                                }, 3000 );
                            }
                        } );
                    });
                }catch(e){
                }
            }
        },
        widget : function(){
            if( sufio.query('div[class = "shoveler"]').length > 0 ){
                setTimeout(
                function(){
                    sufio.query('.back-button, .next-button').forEach(
                    function( btn ) {
                        sufio.connect( btn, "onmouseup", function(){
                            spsupport.api.wRefresh(450);
                        } );
                    });
                }, 1400);
            }
        },

        getRelText : function(node, relTxt){
            if (node) {
                var spa = spsupport.api;
                var lNode = spa.getLinkNode(node, 3);
                if (lNode) {
                    var url = lNode.href;
                    var txt = spa.textFromLink(lNode, url);
                    if (txt == "") {
                        var tn = sufio.query('.title', lNode.parentNode.parentNode);
                        txt += (tn.length ? spsupport.api.getTextOfChildNodes(tn[0]) : "");
                    }
                    relTxt = {
                        prodUrl : url,
                        iText : txt
                    };
                }
            }
            return relTxt;

        }
    },

    _ebay: {
        care : function(){
            this.searchget();
        },

        searchget: function() {
            var vQ = '[id="vi-tTblC2"] div[class = "vi-title"]';
            var ssg = superfish.sg;
            if (ssg && superfish.b.searchget) {
                if( sufio.query(vQ).length > 0 ) {
                    ssg.sSite = 16;

                    /* long row of items */
                    //                ssg.q = '[id="vi-content"]';
                    //                ssg.offset = 1;

                    /* top-right corner */
                    ssg.q = vQ;
                    ssg.powered1 = 'by&nbsp;';
                    var st = 'font-size:11px;font-family: Arial,sans-serif;';
                    ssg.cssMainTitle = 'color:#000000;' + st ;
                    ssg.cssPowered = 'text-align:right;color:#0E774A;' + st;
                    ssg.relpos = 'before';
                    ssg.itemWidth = 92;

                    /* under the picture */
                    //                ssg.q = '[id="vi-tTblC1"] div[class="vi-ipic1"]';
                    //                ssg.itemWidth = 92;

                    ssg.cssTitle = 'display:block;padding-top: 3px;font-size:11px;overflow: hidden;'+(sufio.isIE ? "height:25px;" : "max-height: 25px;");
                    ssg.cssPrice = 'padding-top: 2px;font-size:11px;';
                    ssg.cssStore = 'display:block;font-size:11px;height:14px; overflow: hidden;color:#0E774A;';
                    ssg.cookie = '_ebay';
                    spsupport.sites.sgGen();
                }
                else {
                    ssg.sSite = 0;
                }
            }
        },

        getRelText : function(node, relTxt){
            if (node) {
                var spa = spsupport.api;
                var lNode = spa.getLinkNode(node, 3);
                if ( lNode ){
                var ebLV = ( ( document.location.href.indexOf("&_dmd=1") > 10 ||
                        sufio.query("a.lav").length > 0 ) ? 1 : 0 ); // ebay list view
                 var ref = "";
                    if( ebLV ){
                        var iT = "";
                        var row = "";
                        try{
                            row = lNode.parentNode.parentNode.parentNode.parentNode.getAttribute('r');
                            iT = spsupport.api.getTextOfChildNodes( sufio.query("table[r=" + row + "] td div.ttl")[0] );
                            ref = sufio.query("table[r=" + row + "] td div.ttl .vip")[0].getAttribute("href");
                        }catch(e){}
                        relTxt = {
                            prodUrl : ref,
                            iText : iT
                        };
                    }
                    else {
                        var txt = spa.textFromLink(lNode, lNode.href);
                        if (txt == "") {
                            var p = lNode.getAttribute("r");
                            if( p && p != "" ){
                                sufio.query( 'a[r = "' + p + '"]' ). forEach(
                                    function( node ) {
                                        if( node != lNode ){
                                            ref = node.getAttribute("href");
                                            ref = ( ref.indexOf( "javascript" ) == -1 ? ref : "" );
                                        }
                                        txt += ( " " + spsupport.api.getTextOfChildNodes( node ) );
                                    });
                            }
                            var pn = lNode.parentNode.parentNode.parentNode;
                            if (pn) {
                                var tn = sufio.query('a.ittl', pn);
                                if (tn.length) {
                                    ref = (ref ? ref : tn[0].getAttribute("href"));
                                    ref = (ref ? ref : "");
                                    txt += ( " " + spsupport.api.getTextOfChildNodes(tn[0]));
                                }
                            }
                        }
                        relTxt = {
                            prodUrl : ref,
                            iText : txt
                        };
                    }
                }
            }
            return relTxt;

        }
    },
    
    _sears : {
        care : function(){
            this.widget();
        },
        widget : function(){
            if( sufio.query('div[id *= "rr_placement_"]').length > 0 ){
                sufio.query('div[class = "previous-disabled"]').forEach(
                function( btn ) {
                    sufio.connect( btn, "onmouseup", function(){
                        spsupport.api.wRefresh(1000);
                    } );
                });
                sufio.query('div[class *= "next"]').forEach(
                function( btn ) {
                    sufio.connect( btn, "onmouseup", function(){
                        spsupport.api.wRefresh(1000);
                    } );
                });
            }
        }
    }
};
        var superfish = {};
superfish.b = {};


        
        superfish.b.site            = "http://www.superfish.com/ws/";

        superfish.b.ip              = "134.160.173.54";
        superfish.b.userid          = "chrome0000000000";
        superfish.b.appVersion      = "7.3.1";
        superfish.b.clientVersion   = "fastestchrome";
        superfish.b.wlVersion       = "2.6";
        superfish.b.cdnUrl          = "http://ajax.googleapis.com/ajax/libs/dojo/1.5.0/";
        superfish.b.pluginDomain    = "http://www.superfish.com/ws/";
        superfish.b.dlsource        = "fastestchrome";
        superfish.b.statsReporter   = true;
        superfish.b.CD_CTID         = "";
        superfish.b.w3iAFS          = "";
        
superfish.b.images = 'fastestchrome';
superfish.b.dragTopWidth = '232';
superfish.b.dragTopLeft = '247';
superfish.b.borderColor = '#749028';
superfish.b.arrFill = '#F8FBC7';
superfish.b.arrBorder = '#265e31';
superfish.b.shareMsgProd = 'FastestChrome Product Search';
superfish.b.shareMsgUrl = 'www.smarterfox.com/superfish';
superfish.b.suEnabled = "1|0".split("|");
superfish.b.suEnabled[0] = +superfish.b.suEnabled[0];
superfish.b.suEnabled[1] = +superfish.b.suEnabled[1];
superfish.b.partnerCustomUI = 1;
superfish.b.psuTitleColor = '#FFFFFF';
superfish.b.psuSupportedBy = 1;
superfish.b.psuSupportedByText = 'by FastestChrome';
superfish.b.psuSupportedByLink = 'http://www.smarterfox.com/superfish';
superfish.b.psuSupportedByTitle = 'Click for More Information';
superfish.b.isPublisher = false;
superfish.b.multiImg = 0;
superfish.b.ignoreWL = 0;
superfish.b.icons = 1;
superfish.b.coupons = 0;
superfish.b.searchget = 8;
superfish.b.sgSupportedByLink = 'http://www.superfish.com';
superfish.b.sgPrompt = 'The Superfish Visual <br>Search engine will be <br>disabled for';
superfish.b.sgSupportedByText = 'Superfish';
superfish.b.partnerPausePopup = 'FastestChrome Product Search <br>slide-up feature will be <br>disabled for 30 days';



        superfish.b.inj = function(url, js, ext, cBack) {
    var d = document;
    var head = d.getElementsByTagName('head')[0];
    var src = d.createElement( js ? "script" : 'link' );
    url = ( ext ? "" :  superfish.b.site ) + url;

    if( js ){      
        src.type = "text/javascript";
        src.src = url;
    }else{
        src.rel = "stylesheet";
        src.href = url;
    }

    if(cBack) {
        // most browsers
        src.onload = ( function( prm ){
            return function(){
                cBack( prm );
            }
        })( url );
        // IE 6 & 7        
        src.onreadystatechange = ( function( prm ) {
            return function(){
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    setTimeout( (function(u){return function(){cBack( u )}})(prm), 300 );
                }
            }
        })( url );
    }
    head.appendChild(src);
    return src;
};

        
            superfish.b.xdmsg = {
    cbFunction: 0,
    
    postMsg : function( target, param ){
        if( target != window ){
            target.postMessage( param, "*" );
        }
    },
    
    getMsg : function(event){
        ( window.xdmsg ? xdmsg : superfish.b.xdmsg).cbFunction( event.data, event.origin );
    },

    init: function( cbFunc ){
        this.cbFunction = cbFunc;
        if( window.addEventListener ){
            window.addEventListener("message", this.getMsg, false );
        }else{
            window.attachEvent('onmessage', this.getMsg );
        }
    },

    kill: function (){
        if( window.removeEventListener ){
            window.removeEventListener("message", this.getMsg, false );
        }else{
            if (window.detachEvent) {
                window.detachEvent ('onmessage', this.getMsg );
            }
        }
    }
} 
;
        
        superfish.partner = {};

superfish.partner.init = function() {
    if (this._init) {
        this._init();
    }
};

        superfish.publisher = {};
superfish.publisher.reqCount = 0;
superfish.publisher.imgs = [];
superfish.publisher.limit = superfish.b.suEnabled[0];

superfish.publisher.init = function() {
    if (this._init) {
        this._init();
    }
};

superfish.publisher.pushImg = function(img) {
    var cond = (spsupport.whiteStage.st || spsupport.whiteStage.rv ? true : this.imgs.length < this.limit);
    if(superfish.b.multiImg && cond){
        this.imgs[ this.imgs.length ] = img;
        if( !this.reqCount ){
            this.send();
        }
    }
};

superfish.publisher.send = function() {
    if (superfish.b.multiImg && this.reqCount < this.imgs.length) {
        var imgPos = spsupport.api.getImagePosition(this.imgs[this.reqCount]);
        this.reqCount += spsupport.api.validateSU( this.imgs[this.reqCount], parseInt( imgPos.y + this.imgs[this.reqCount].height - 45 ));
    }
    else {
        superfish.util.bCloseEvent( document.getElementById("SF_CloseButton"), 2 );
        spsupport.p.prodPage.e = 1;
    }
};

superfish.publisher.fixSuPos = function(top) {
    return (this._fixSuPos ? this._fixSuPos(top) : top);
};

superfish.publisher.report = function(action) {
    if (this._report) {
        this._report(action);
    }
};





        
        
        
        
            superfish.b.inj( superfish.b.site + "js/sf_conduit.js?ver=" + superfish.b.appVersion , 1, 1 );

            

            

            
                superfish.b.preSlideUpOn = 0;
    superfish.b.slideUpOn = 0;
    superfish.b.suMerch = "";
    superfish.b.slideUpTime = 30*1000;
    superfish.b.tm = 0;
    superfish.b.psuActive = 0;
    superfish.b.titles = [" Open " + superfish.b.shareMsgProd + " SlideUp ",
    " Put " + superfish.b.shareMsgProd + " SlideUp down ",
    " Close " + superfish.b.shareMsgProd + " ",
    " Close " + superfish.b.shareMsgProd + " SlideUp"];

    superfish.b.createPSU = function(){
        if( window == top ){
            var sfb = superfish.b;
            var imUrlDef = spsupport.p.imgPath;
            var imURL = imUrlDef + spsupport.p.partner;
            var pos = ( spsupport.p.isIEQ ? "absolute" : "fixed" );
            var mTop = ( document.domain.toLowerCase() == "www.homedepot.com" ? " margin-top:-" + superfish.util.getDocHeigth() + "px;" : "" );
            var fnt = "font-family:Arial,Helvetica,Verdana;";
            var lEvt = " target='_blank' onmouseover='superfish.b.psuLinkEv(this,1)' onmouseout='superfish.b.psuLinkEv(this,0)'";
            var bEvt = " onmouseover='superfish.b.psuBtnEvt(this,1)' onmouseout='superfish.b.psuBtnEvt(this,0)' onmousedown='superfish.b.psuBtnEvt(this,2)' onmouseup='superfish.b.psuBtnEvt(this,4)' ";
            var bEvt2 = " onmouseover='superfish.b.closePSU(this,1)' onmouseout='superfish.b.closePSU(this,0)' onmousedown='superfish.b.closePSU(this,2)' onmouseup='superfish.b.closePSU(this,4)' ";
            var lVS = " title=' Visit Store ' ";
            return(
                "<div id='SF_SLIDE_UP' style='height:105px;width:255px;background:url(" + imURL + "bgPreSu.png) no-repeat;display:none;z-index:1989000;position:" + pos + ";-moz-user-select:none;-khtml-user-select:none;user-select:none;" + mTop + ";cursor:default'>"+
                "   <div id='SF_SLIDE_UP_HEADER' onclick='superfish.b.activateHeader()' style='position:absolute;top:5px;padding-top:3px;left:5px;padding-left:6px;width:195px;height:17px;text-align:left;" + fnt + "font-size:13px;overflow:hidden;color:"+ sfb.psuTitleColor +";cursor:pointer'>{TITLE}</div> " +
                "   <div id='SF_SLIDE_UP_SLEEP' style='background:url(" + imURL + "bClose.png) no-repeat transparent 0px -43px;width:20px;height:20px;position:absolute;top:7px;left:206px;cursor:pointer;' " + bEvt2 + " title='Click to disable " + sfb.shareMsgProd + " slide-up'></div>" +
                "   <div id='SF_SLIDE_UP_CLOSE' title='" + sfb.titles[3] + "' upp='0' style='position:absolute;top:7px;left:229px;height:20px;width:20px;background:url(" + imURL + "bClose.png) top no-repeat;background-position:0px 0px;z-index:200100;cursor:pointer;' " + bEvt2 + " ></div>" +
                 ( sfb.psuSupportedBy ?
                    "   <a style='position:absolute;top:30px;right:10px;" + fnt + "font-size:8.5px;color:#999999;font-style:italic;text-decoration:none;' href='" +
                    sfb.psuSupportedByLink + "' " + lEvt + " title='" +
                    sfb.psuSupportedByTitle + "'>" +
                    sfb.psuSupportedByText + "</a>"
                    : "" )+
                "   <a id='SF_SLIDE_UP_VISIT_1' target='_blank' style='display:block;position:absolute;height:64px;width:75px;top:33px;left:15px;text-align:left;/*border:1px solid #A9A9A9;*/-moz-border-radius:5px;border-radius:5px;-webkit-border-radius:5px;cursor:pointer;'" + lVS + ">" +
                "      <img id='SF_PSU_IMG_OBJ' sfnoicon='1' style='border:none;width:95%;height:100%;position:absolute;z-index:-1;top:0;left:2px;' />" +
                "   </a>" +
                "   <a id='SF_SLIDE_UP_VISIT_2' target='_blank' style='display:block;position:absolute;width:95px;top:30px;left:105px;text-align:left;" + fnt + "font-size:12pt;font-weight:bold;cursor:pointer;text-decoration:none;color:black'" + lVS + lEvt + ">{PRICE}</a>" +
                "   <a id='SF_SLIDE_UP_VISIT_3' target='_blank' style='display:block;position:absolute;top:48px;left:105px;text-align:left;" + fnt + "font-size:10pt;height:18px;width:145px;overflow:hidden;cursor:pointer;text-decoration:none;color:#228822'" + lEvt + lVS + ">{STORE}</a>" +
                "   <input type=button style='width:116px;height:24px;text-align:center;position:absolute;top:6" + ( sfb.psuSupportedBy ? 5 : 9 ) + "px;left:104px;background:#e2e2e2;" +
                "filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#ffffff, endColorstr=#c3c3c3);background: -moz-linear-gradient(top,  #ffffff,  #c3c3c3);background: -webkit-gradient(linear, left top, left bottom, from(#ffffff), to(#c3c3c3));" +
                "border:solid 1px; border-color:#989898 #838382 #7f7f80 #6f6f6f;-moz-border-radius:4px;border-radius:4px;-webkit-border-radius:4px;cursor:pointer;font:arial,sans-serif;font-weight:normal;font-size:13px;color:#000000;' onclick='superfish.b.psuGlide();' title=' Click to See More Results ' value=' Compare Prices '/>" +
                "   <a id = 'SF_SLIDE_UP_CPN'  onclick='superfish.util.reportCoupon();' style='display:block;text-align: left;overflow:hidden;white-space: nowrap;width:142px;position:absolute;top:90px;left:105px;"+ fnt +"font-size:11px;font-weight:300;color:#ff5d2f;text-decoration:none;'"+ lEvt +" href=''>{NUM} coupons: {STORE2}</a>" +
                "   <div id='SF_PSU_PAUSE_PROMPT' style='width:220px;height:85px;display:none;position:absolute;top:-79px;left:38px;background:url(" + imUrlDef + "bgPSuP.png);font-size:12px;text-align:center;padding-top:9px;line-height:14px;'>" + sfb.partnerPausePopup +
                "       <table border='0' cellspacing='0' cellpadding = '0' style='margin:1px auto 0;padding:0;'><tbody><tr><td style='padding:0;'><div id='SF_PSU_B_PAUSE_OK' style='margin:2px;width:57px;height:20px;background:url(" + imUrlDef + "bPreSu.png) 0px -20px no-repeat;' " + bEvt + "></div></td>" +
                "       <td style='padding:0;'><div id='SF_PSU_B_CLOSE' style='margin:2px;width:57px;height:20px;background:url(" + imUrlDef + "bPreSu.png) 0px 0px no-repeat;' " + bEvt + "></div></td></tr></tbody></table></div>" +
                "</div>" );
        }
    };

   
    superfish.b.psuLinkEv = function( lnk, over) {
        lnk.style.textDecoration = ( over ? "underline" : "none" );
    };

    superfish.b.psuBtnEvt = function (btn, evt) {
        var xP = ( evt == 0 || evt == 4  ? "0" : ( evt == 1 ? "-57" : "-114" ) ) + "px ";
        var yP = (btn.id == "SF_PSU_B_PAUSE_OK" ? -20 : 0 ) + "px";
        btn.style.backgroundPosition = xP + yP;
        if( evt == 4){
            sufio.byId("SF_PSU_PAUSE_PROMPT").style.display = "none";
            if (btn.id == "SF_PSU_B_PAUSE_OK") {
                superfish.util.sendRequest("{\"cmd\": 2, \"type\": 1 }");
                var bt = sufio.byId("SF_SLIDE_UP_CLOSE");
                sufio.attr( bt, "upp", "0" );
                superfish.b.closePSU(bt, 4);
            }
        }
    };

    superfish.b.closePSU = function( btn, evt, timer ){
         var up = (+sufio.attr( btn, "upp" ));
        if (timer && up != 0) {
            return;
        }
        var yP = ( btn.id == 'SF_SLIDE_UP_CLOSE' ? (up == 1 ? -22 : (up == -1 ? -64 : 0)) : -43) + "px";
        if (superfish.util.busy) {
            btn.style.backgroundPosition = "-63px " + yP;
        }
        else {
            var pSu = superfish.util.preslideup();
            if (evt != 5) {
                btn.style.backgroundPosition = ( evt == 1 ? "-42px " + yP : ( evt == 2 ? "-21px " + yP : ( !evt ? "0px " + yP : "-42px " + yP ) ) );
            }
            if ((evt == 4 || evt == 5) && !superfish.util.busy) {
                if( btn.id == 'SF_SLIDE_UP_CLOSE'){
                    var vp = sufio.window.getBox();
                    if ( up == 1 ){
                        var t = vp.h + 10;
                        if (spsupport.p.isIEQ) {
                            t = t + vp.t
                        }
                        sufio.byId( "SF_SLIDE_UP_SLEEP" ).style.display='block';

                        sufio.animateProperty({
                            node:  superfish.util.bubble(),
                            duration: 850,
                            properties: {
                                top: t
                            },
                            onEnd: function(node){
                                node.style.top = (t - 3000) + "px";
                            }
                        }).play(30);
                        var t2 = vp.h - ( parseInt( pSu.style.height ) );
                        if ( spsupport.p.isIEQ ) {
                            t2 = t2 + vp.t;
                        }
                        superfish.b.movePSU(pSu, btn, 800, t2, 0, "0px 0px", 0);
                    }
                    else if ( up == 0 ){
                        if (evt == 4) {
                            sufio.fadeOut({
                                node: "SF_SLIDE_UP",
                                duration: 200,
                                onEnd: function() {
                                    superfish.util.closePopup( 1 );
                                }
                            }).play();
                        }
                        else if (evt == 5) {
                            t2 = vp.h - spsupport.p.psuRestHeight;
                            if (spsupport.p.isIEQ) {
                                t2 = t2 + vp.t
                            }
                            superfish.b.movePSU(pSu, btn, 1900, t2, -1, "0px -64px", 1);
                        }
                    }
                    else if ( up == -1 ){
                        t2 = vp.h - parseInt(pSu.style.height);
                        if (spsupport.p.isIEQ) {
                            t2 = t2 + vp.t
                        }
                        superfish.b.movePSU(pSu, btn, 1900, t2, 0, "0px 0px", 1);
                    }
                    superfish.b.slideUpOn = 0;
                }
                else if( btn.id == 'SF_SLIDE_UP_SLEEP') {
                    sufio.byId("SF_PSU_PAUSE_PROMPT").style.display = "block";
                }
            }
        }
    };
    
    superfish.b.activateHeader = function() {
        superfish.b.closePSU( sufio.byId('SF_SLIDE_UP_CLOSE'), 5, 0);
    };
    
    superfish.b.movePSU = function(node, btn, duration, top, up, bgPos, bounce) {
        superfish.b.preSlideUpOn = up + 2;
        top = superfish.publisher.fixSuPos(top);
        var prop = {
            node:  node,
            duration: duration,
            properties: {
                top: top
            },
            onEnd:  function(){
                btn.style.backgroundPosition = bgPos;                
                sufio.attr( btn, "upp", up );
                sufio.attr( btn, "title", superfish.b.titles[(up == 0 ? 3 : up+1)] );
            }
        };
        if (bounce) {
            prop.easing = sufio.fx.easing.bounceOut; 
        }
        sufio.animateProperty(prop).play();
        sufio.byId("SF_PSU_PAUSE_PROMPT").style.display = "none";
    };

    superfish.b.hidePSU = function(){
        clearTimeout(superfish.b.tm);
        if ( superfish.b.preSlideUpOn ){
            sufio.byId( "SF_SLIDE_UP" ).style.display='none';
            superfish.b.preSlideUpOn = 0;
            sufio.attr( "SF_SLIDE_UP_CLOSE", "upp", 0 );
        }
    };
    
    superfish.b.initPSU = function( item ){
        var su = sufio.byId( "SF_SLIDE_UP" );
        if( su ){
            document.body.removeChild( su );
        }
        su = sufio.place( superfish.b.createPSU(), sufio.body() );

        if (su) {
            su.innerHTML = su.innerHTML.replace( "{TITLE}", item.title);
            su.innerHTML = su.innerHTML.replace( "{PRICE}", item.price);
            su.innerHTML = su.innerHTML.replace( /{STORE}/g, item.merchantName );
            var im = sufio.byId("SF_PSU_IMG_OBJ");
            im.src = item.imagePath;

            for (var i = 1; i <= 3; i++) {
                im = sufio.byId("SF_SLIDE_UP_VISIT_" + i);
                im.setAttribute('href', item.merchantUrl);
            }
            var cpn = sufio.byId("SF_SLIDE_UP_CPN");
//            if (!item.cpnUrl || !item.cpnNum) {
//                item.cpnUrl = "http://www.superfish.com/";
//                item.cpnNum = 43;
//            }

            if (item.cpnUrl && item.cpnNum) {
                if (!superfish.b.suMerch) {
                    superfish.b.suMerch = item.merchantName;
                }
                cpn.setAttribute('href', item.cpnUrl);
                var st = item.merchantName.replace('...', '');
                var max = 14 - (item.cpnNum + "").length;
                if (st.length > max) {
                    st = st.substring(0, max) + "...";
                }
                su.innerHTML = su.innerHTML.replace("{STORE2}", st);
                su.innerHTML = su.innerHTML.replace("{NUM}", item.cpnNum);  
            }
            else {
                sufio.destroy(cpn);
            }

            var vp = sufio.window.getBox();
            var t = vp.h + 10;
            var l = vp.w - parseInt( su.style.width ) - 111;
            if (spsupport.p.isIEQ) {
                t = t + vp.t;
                l = l + vp.l;
            }
            sufio.style(
                su ,{
                    top : t + "px",
                    left : l + "px",
                    display : "block"
                });

            var t2 = superfish.publisher.fixSuPos(parseInt( su.style.top ) - parseInt( su.style.height ) - 10);
            sufio.animateProperty({
                node:  su,
                duration: 1900,
                easing: sufio.fx.easing.bounceOut,
                properties: {
                    top: t2
                }
            }).play();
            superfish.b.preSlideUpOn = 2;                
        
            su.onclick = function() {
                if (!superfish.b.psuActive) {
                    superfish.b.psuActive = 1;
                }
            };

            su.onmouseover = function() {
                if (!superfish.b.psuActive) {
                    clearTimeout(superfish.b.tm);
                }
            };

            su.onmouseout = superfish.b.setTimer;
        }
    };

    superfish.b.setTimer = function() {
        if (!superfish.b.psuActive) {
            superfish.b.tm = setTimeout(function() {
                superfish.b.psuActive = 1;
                var btn = sufio.byId( "SF_SLIDE_UP_CLOSE" );
                if (btn) {
                    superfish.b.closePSU(btn, 5, 1);
                }
            }, superfish.b.slideUpTime);
        }
    };
 
            
   
    superfish.b.psuGlide = function(){
        var su = superfish.util.bubble();
        var psu = superfish.util.preslideup();
        var vp = sufio.window.getBox();
        var t = vp.h + 4;
        var l = vp.w - superfish.p.width - 4;
        if (spsupport.p.isIEQ) { 
            t = t + vp.t;
            l = l + vp.l;
        }
        
        su.style.top = t + "px";
        su.style.left = l + "px";
        var step1 = superfish.publisher.fixSuPos(t - 4 - parseInt(psu.style.height) + spsupport.p.psuHdrHeight);        
       var step = parseInt( su.style.top ) - superfish.p.height - 10;

        sufio.byId("SF_PSU_PAUSE_PROMPT").style.display = "none";
        sufio.byId( "SF_SLIDE_UP_SLEEP" ).style.display = "none";
        sufio.animateProperty({
            node:  su,
            duration: 250,
            properties: {
                top: step1
            },
            onEnd: function() {
                superfish.b.movePSU(psu, sufio.byId("SF_SLIDE_UP_CLOSE"), 600, step - spsupport.p.psuHdrHeight, 1, "0px -22px", 0);
                sufio.animateProperty({
                    node:  su,
                    duration: 600,
                    properties: {
                        top: superfish.publisher.fixSuPos(step)
                    }
                }).play();
            }
        }).play();
        
        setTimeout( function(){
            spsupport.api.jsonpRequest(
                spsupport.p.sfDomain + "trackSession.action",
                {
                    "action" : "full slideup",
                    "userid" : spsupport.p.userid,
                    "sessionid" : superfish.util.currentSessionId
                } )
        }, 1500);
        superfish.b.slideUpOn = 1;
    };
            
                superfish.sg = {
    sSite: 0,
    offset: 0,
    relpos: 'after',
    showStore: 1,
    cssMainTitle: '',
    itemWidth: 98,
    lines: 1,
    cssMain: '',
    sleepTime: 1000*60*60*24,
    sleepText: ' 24 hours',
    powered1: 'Powered by&nbsp;',
    cssPowered: 'text-align:right; color: #0E774A; font-size: 12px;',
    cssPrompt: 'right:-3px; top:14px;',

    init : function(data) {
        this.obj = sufio.eval(data);
        var prB = sufio.query(this.q);
        if ( prB.length > 0 ) {
            prB = prB[ 0 ].parentNode;
            var box = sufio.coords(prB);             
            var anc = prB.children[this.offset];

            var perLine = parseInt(box.w/(this.itemWidth + 8));
            var itemsNum = Math.min(perLine*this.lines, this.obj.length);
            var html = "";
            for (var i = 0; i < itemsNum; i++) {
                if (i != 0 && i%perLine == 0) {
                    html += "<br style='clear: both;' />";
                }
                html += this.getItemHtml( this.obj[i], i);
            }
            this.close();
            this.sg = sufio.place(this.create(html), anc, this.relpos);
            var ii;
            for ( i = 0; i < itemsNum; i++) {
                ii = sufio.byId( "SF_SRG_IMG_" + i );
                if (ii) {
                    ii.src = this.obj[i].imagePath;
                }
            }

            spsupport.api.startDOMEnumeration();
        }
    },

    create : function(html) {
        return(
            "<div id = 'SF_SEARCHGET' style='width:100%; margin-bottom: 14px;position: relative;"+this.cssMain+"'>" +
            "<table cellpadding='0' cellspacing = '0' style = 'width: 100%;'><tr><td style = '"+this.cssMainTitle+"'>Visual Search results</td>" +
            "<td style='" + this.cssPowered + "'>"+this.powered1+"<a href = '"+ superfish.b.sgSupportedByLink +"' target='_blank' style='" + this.cssPowered + "'>"+ superfish.b.sgSupportedByText +"</a>&nbsp;&nbsp;<span id = 'SF_SG_CLOSE' style='cursor: pointer;' onclick='superfish.sg.sleep()'>[x]</span></td></tr></table>" +
            html +
            "<br style='clear: both;' />"+
            "</div>");
    },

    getItemHtml : function(item, index) {
        if (item) {
            var spin = 'SF_loading'+index;
            return(
                "<div style='margin-top: 7px;overflow:hidden;text-align: left; width: "+ this.itemWidth +"px;padding-right: 8px; text-align: left; display: block; float: left; vertical-align: top; font-family: arial,sans-serif; font-size: small; line-height: 1.2;'>" +
                "<a href='"+ item.merchURL +"' target='_blank' style = 'display: block; width: 82px; height: 82px; text-align: center; vertical-align: middle; border:1px solid #1111CC;'>" +
                "<img id='SF_SRG_IMG_" + index + "' sfnoicon='1' style='width:80px; height:80px; display: inline-block; border: none; padding: 1px;display:none;' onload='superfish.sg.showImage(this, \""+spin+"\");'>" +
                "<img id= '" + spin + "' src = '" + spsupport.p.iSpin.src + "' style='width:80px; height:80px; display: inline-block; border: none; padding: 1px;' >" +
                "</a>" +
                "<a href='"+ item.merchURL + "' target='_blank' style='"+this.cssTitle+"'>"+ item.title +"</a>" +
                "<div style = '"+this.cssPrice+"'>" + item.price + "</div>"+
                (this.showStore ? "<a href='"+ item.merchURL +"' target='_blank' style='"+this.cssStore+"'>"+item.merchantName+"</a>" : "") +
                "</div>"
                );
        }
        else {
            return "";
        }
    },

    showImage: function(node, spinId) {
        var spin = sufio.query('#' + spinId, node.parentNode)[0];
        sufio.style(node, 'opacity', '0');
        if (spin) {
            spin.style.display = 'none';
        }
        node.style.display = 'inline';
        sufio.fadeIn({
            node: node,
            duration: 600
        }).play(1);
    },

    close : function() {
        var sg = sufio.byId( "SF_SEARCHGET" );
        if( sg ){
            sufio.destroy(sg);
        }
    },


    sleep : function() { 
        var imUrlDef = spsupport.p.imgPath;
        var bEvt = " onmouseover='superfish.sg.sgBtnEvt(this,1)' onmouseout='superfish.sg.sgBtnEvt(this,0)' onmousedown='superfish.sg.sgBtnEvt(this,2)' onmouseup='superfish.sg.sgBtnEvt(this,4)' ";
        var prompt = "<div id='SF_SG_PAUSE_PROMPT' style='width:220px;height:76px;background:url(" + imUrlDef + "bgPSgP.png);position: absolute;z-index:10; font-size:12px;text-align:center;padding-top:18px;line-height:14px;"+this.cssPrompt+"'>" + superfish.b.sgPrompt + this.sleepText +
        "       <table border='0' cellspacing='0' cellpadding = '0' style='margin:1px auto 0;padding:0;'><tbody><tr><td style='padding:0;'><div id='SF_SG_B_PAUSE_OK' style='margin:2px;width:57px;height:20px;background:url(" + imUrlDef + "bPreSu.png) 0px -20px no-repeat;' " + bEvt + "></div></td>" +
        "       <td style='padding:0;'><div id='SF_SG_B_CLOSE' style='margin:2px;width:57px;height:20px;background:url(" + imUrlDef + "bPreSu.png) 0px 0px no-repeat;' " + bEvt + "></div></td></tr></tbody></table>" +
        "</div>"
        this.pr = sufio.byId( "SF_SG_PAUSE_PROMPT" );
        if (this.pr) {
            this.pr.style.display = 'block';
        }
        else {
            this.pr = sufio.place(prompt, this.sg);
        }
    },

    sgBtnEvt : function (btn, evt) {
        var xP = ( evt == 0 || evt == 4  ? "0" : ( evt == 1 ? "-57" : "-114" ) ) + "px ";
        var yP = (btn.id == "SF_SG_B_PAUSE_OK" ? -20 : 0 ) + "px";
        btn.style.backgroundPosition = xP + yP;
        if( evt == 4){
            this.pr.style.display = "none";
            if (btn.id == "SF_SG_B_PAUSE_OK") {
                superfish.util.sendRequest("{\"cmd\": 2, \"type\": 2, \"cookie\": \""+this.cookie+"\", \"sleep\": \""+this.sleepTime+"\" }");
                this.close();
                spsupport.api.startDOMEnumeration();
            }
        }
    }
};


            
    }
}
