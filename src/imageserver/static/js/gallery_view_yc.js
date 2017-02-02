/*!
	Document:      gallery_view.js
	Date started:  26 July 2013
	By:            Matt Fozard
	Purpose:       Quru Image Server gallery viewer
	Requires:      canvas_view.js
	               MooTools Core 1.3 (no compat)
	               MooTools More 1.3 - Element.Measure, Fx.Scroll, Mask,
	               Request.JSONP, String.QueryString, URI
	Copyright:     Quru Ltd (www.quru.com)
	Licence:

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see http://www.gnu.org/licenses/

	Last Changed:  $Date$ $Rev$ by $Author$
	
	Notable modifications:
	Date       By    Details
	=========  ====  ============================================================
	11Oct2013  Matt  Strip halign and valign from all images by default
	11Nov2013  Matt  Add title/description image options, set title on thumbnails
	11Nov2013  Matt  Add events interface
*/
function GalleryView(a,c,b){this.options={server:"",folder:"",images:[],params:{},startImage:"",thumbsize:{width:120,height:120},viewer:{},jsonp:true,stripaligns:true};
if(c!==undefined){this.options=Object.merge(this.options,c);}this.options.viewer.jsonp=this.options.jsonp;
this.events=b;this.options.server=this._add_slash(this.options.server);this.options.folder=this._add_slash(this.options.folder);
this.options.images.each(function(d){if(d.server){d.server=this._add_slash(d.server);}}.bind(this));this.firstIdx=0;
this.thumbIdx=-1;this.thumbnails=[];this.touchAttrs={last:{x:0,y:0}};this.ctrEl=document.id(a);this.ctrEl.empty();
this.elements={};this.create_ui();this.layout();}GalleryView.prototype.init=function(){this.setMessage("Loading gallery...");
if(this.options.folder){this.addFolderImages();}else{this.onDataReady(null);}};GalleryView.prototype.destroy=function(){this.events=null;
if(this.elements.main_view&&this.elements.main_view._viewer){this.elements.main_view._viewer.destroy();
}this.ctrEl.empty();};GalleryView.prototype.create_ui=function(){var h=new Element("div",{"class":"gallery"});
this.ctrEl.grab(h);var g=new Element("div",{"class":"main_view",styles:{"text-align":"center"}});var f=new Element("div",{"class":"thumbnails",styles:{overflow:"hidden",position:"relative"}});
h.grab(g);h.grab(f);var e=new Element("a",{"class":"scroll_button disabled",html:"&lt;",styles:{display:"block",position:"absolute","z-index":"1",top:0,left:0,margin:0}});
var a=new Element("a",{"class":"scroll_button disabled",html:"&gt;",styles:{display:"block",position:"absolute","z-index":"1",top:0,right:0,margin:0}});
f.grab(e);f.grab(a);var b=new Element("div",{"class":"scroller_viewport",styles:{overflow:"hidden","margin-left":e.getSize().x+"px"}});
var d=new Element("div",{styles:{overflow:"auto"}});var c=new Element("div",{"class":"scroller",styles:{position:"relative","white-space":"nowrap"}});
d.grab(c);b.grab(d);f.grab(b);d.addEvent("scroll",function(){this.onThumbsScroll();}.bind(this));e.addEvent("click",function(){this.scrollRelative(-1);
return false;}.bind(this));a.addEvent("click",function(){this.scrollRelative(1);return false;}.bind(this));
this.elements={wrapper:h,main_view:g,tn_wrapper:f,tn_viewport:b,tn_scrollable:d,tn_panel:c,tn_left:e,tn_right:a};
this.scroller=new Fx.Scroll(d,{transition:"sine:in:out",duration:500});};GalleryView.prototype.layout=function(){var b=this.ctrEl.getComputedSize(),h=this.elements.wrapper.getComputedSize({styles:["margin","padding","border"]}),f=this.elements.tn_wrapper.getComputedSize({styles:["margin","padding","border"]}),e=this.options.thumbsize.height+12,c=b.height-(h.computedTop+h.computedBottom+f.computedTop+f.computedBottom+e);
if(c%2==1){c--;}this.elements.main_view.setStyles({height:c+"px","line-height":c+"px"});this.elements.tn_wrapper.setStyles({height:e+"px","line-height":e+"px"});
this.elements.tn_left.setStyles({height:e+"px","line-height":e+"px"});this.elements.tn_right.setStyles({height:e+"px","line-height":e+"px"});
var g=this.elements.tn_wrapper.getSize().x,d=this.elements.tn_left.getSize().x,a=g-(2*d);this.elements.tn_viewport.setStyles({width:a+"px",height:e+"px"});
this.elements.tn_scrollable.setStyles({width:a+"px"});this.elements.tn_panel.setStyles({height:e+"px","line-height":e-4+"px"});
canvas_view_resize(this.elements.main_view);};GalleryView.prototype.setMessage=function(a){this.elements.main_view.innerHTML='<span style="font-size: small">'+a+"</span>";
};GalleryView.prototype.addFolderImages=function(){var a=this.options.server+"api/v1/list?path="+encodeURIComponent(this.options.folder);
if(this.options.jsonp){new Request.JSONP({url:a,callbackKey:"jsonp",onComplete:function(b){this.onDataReady(b);
}.bind(this)}).send();}else{new Request.JSON({url:a,onSuccess:function(b){this.onDataReady(b);}.bind(this),onFailure:function(b){this.setMessage("");
}.bind(this)}).get();}};GalleryView.prototype.onDataReady=function(h){if(h&&(h.status==200)){for(var b=0;
b<h.data.length;b++){this.options.images.push({src:this.options.folder+h.data[b].filename});}}if(this.options.images.length>0){var g=[],a=false;
for(var b=0;b<this.options.images.length;b++){var f=this.options.images[b],c={};Object.append(c,this.options.params);
Object.append(c,f);delete c.server;delete c.title;delete c.description;c.width=this.options.thumbsize.width;
c.height=this.options.thumbsize.height;c.strip=1;if(!c.format){c.format="png";}if(!c.fill){c.fill="none";
}if(this.options.stripaligns){delete c.halign;delete c.valign;}var e=f.server?f.server:this.options.server,d=e+"image?"+Object.toQueryString(c);
if(!g.contains(d)){if((this.options.startImage===c.src)&&!a){this.firstIdx=b;a=true;}g.push(d);this.addThumbnail(d,b,f.title,f.description);
}}this.setScrollButtons();}else{this.setMessage("There are no images to display");}};GalleryView.prototype.addThumbnail=function(e,a,d,b){var c=new Element("img",{src:e,"data-index":a,title:d?d:"",draggable:"false"});
if(d){c.set("data-title",d);}if(b){c.set("data-description",b);}this.thumbnails.push(c);this.elements.tn_panel.grab(c);
c.addEvent("load",function(){this.onThumbLoaded(c,a);}.bind(this));if("ontouchstart" in window&&window.Touch){c.addEvent("touchstart",function(f){this.onThumbTouchStart(f,a);
}.bind(this));c.addEvent("touchend",function(f){this.onThumbTouchEnd(f,a);}.bind(this));}else{c.addEvent("click",function(){this.onThumbClick(c,a);
}.bind(this));}};GalleryView.prototype.onThumbLoaded=function(b,a){this.setScrollButtons();if(this.firstIdx===a){this.moveDirect(a);
}};GalleryView.prototype.onThumbTouchStart=function(b,a){if(b.touches.length===1){this.touchAttrs.last.x=b.touches[0].pageX;
this.touchAttrs.last.y=b.touches[0].pageY;}return true;};GalleryView.prototype.onThumbTouchEnd=function(b,a){if(Math.abs(this.touchAttrs.last.x-b.changedTouches[0].pageX)<10&&Math.abs(this.touchAttrs.last.y-b.changedTouches[0].pageY)<10){this.onThumbClick(b.target,a);
}return true;};GalleryView.prototype.onThumbClick=function(b,a){this.moveDirect(a);};GalleryView.prototype.scrollDirect=function(a,c){if(this.thumbnails.length){var d=this.getScrollInfo(),a=Math.max(0,Math.min(this.thumbnails.length-1,a));
if(c==="left"){if(a>0){var b=this.thumbnails[a];this.scroller.start(b.offsetLeft-d.thumbMargin,0);}else{this.scroller.start(0,0);
}}else{if(a<(this.thumbnails.length-1)){var e=this.thumbnails[a+1];this.scroller.start(e.offsetLeft-d.viewportWidth,0);
}else{this.scroller.start(d.scrollTotal-d.viewportWidth,0);}}}};GalleryView.prototype.scrollRelative=function(b){if(this.thumbnails.length&&b){var a=this.getScrollInfo();
if(b<0){if(a.scrollFrom>0){this.scrollDirect(a.startThumbIdx+b,"left");}}else{if(a.scrollTo<a.scrollTotal){this.scrollDirect(a.endThumbIdx+b,"right");
}}}};GalleryView.prototype.moveRelative=function(a){if(this.thumbnails.length&&a){this.moveDirect(this.thumbIdx+a);
}};GalleryView.prototype.moveDirect=function(a){if(this.thumbnails.length){a=Math.max(0,Math.min(this.thumbnails.length-1,a));
if(a!==this.thumbIdx){this.thumbIdx=a;this.thumbnails.each(function(b){b.removeClass("selected");});this.thumbnails[a].addClass("selected");
if(this.moveTimer!==undefined){clearTimeout(this.moveTimer);}this.moveTimer=setTimeout(this.onMoveComplete.bind(this),100);
}}};GalleryView.prototype.onMoveComplete=function(){delete this.moveTimer;this.autoThumbScroll();var b=this.thumbnails[this.thumbIdx],a=Object.clone(this.options.viewer);
if(b.get("data-title")!=null){a.title=b.get("data-title");}if(b.get("data-description")!=null){a.description=b.get("data-description");
}if(this.events){_fire_event(this.events.onchange,this,[this.options.images[this.thumbIdx].src]);}canvas_view_init(this.elements.main_view,b.src,a,this.events);
};GalleryView.prototype.onThumbsScroll=function(){if(this.scrollTimer!==undefined){clearTimeout(this.scrollTimer);
}this.scrollTimer=setTimeout(this.onThumbsScrollComplete.bind(this),100);};GalleryView.prototype.onThumbsScrollComplete=function(){delete this.scrollTimer;
this.setScrollButtons();if(this.autoScrollIdx!==undefined){if(this.autoScrollIdx!==this.thumbIdx){delete this.autoScrollIdx;
this.autoThumbScroll();}else{delete this.autoScrollIdx;}}};GalleryView.prototype.autoThumbScroll=function(){var a=this.thumbIdx,b=this.getScrollInfo();
if(this.autoScrollIdx===undefined){this.autoScrollIdx=a;}if(a===b.startThumbIdx){this.scrollRelative(-1);
}else{if(a===b.endThumbIdx){this.scrollRelative(1);}else{if(a<b.startThumbIdx){this.scrollDirect(a,"left");
}else{if(a>b.endThumbIdx){this.scrollDirect(a,"right");}else{delete this.autoScrollIdx;}}}}};GalleryView.prototype.getScrollInfo=function(){var g=this.elements.tn_scrollable,b=this.elements.tn_panel,n=g.getParent(),e=g.getScroll().x,a=Math.max(g.getScrollSize().x,b.getScrollSize().x),l=n.getSize().x,m=e+l;
var j=-1,d=-1,h=this.thumbnails[0].getSize().x,k=h-this.thumbnails[0].width;for(var f=0;f<this.thumbnails.length;
f++){var o=this.thumbnails[f],c=((o.offsetLeft+h)<=e)||(o.offsetLeft>=m);if(!c){if(j==-1){j=f;}d=Math.max(d,f);
}if(c&&(d!=-1)){break;}}return{scrollFrom:e,scrollTo:m,scrollTotal:a,viewportWidth:l,thumbMargin:k,startThumbIdx:j,endThumbIdx:d};
};GalleryView.prototype.setScrollButtons=function(){var a=this.getScrollInfo();if(a.scrollFrom<=0){this.elements.tn_left.addClass("disabled");
}else{this.elements.tn_left.removeClass("disabled");}if(a.scrollTo>=a.scrollTotal){this.elements.tn_right.addClass("disabled");
}else{this.elements.tn_right.removeClass("disabled");}};GalleryView.prototype._add_slash=function(a){if(a&&a.charAt(a.length-1)!="/"){return a+"/";
}else{return a;}};function GalleryViewMask(a,b){this.options=a;this.events=b;if(!this.options){this.options={};
}if(!this.options.viewer){this.options.viewer={};}if(!this.options.viewer.controls){this.options.viewer.controls={};
}this.options.viewer.controls.fullscreen=false;this.fullScreenFixed=true;this.animating=false;this.ctrEl=null;
this.mask=null;this.fullKeydownFn=function(c){this.fullscreenKeydown(c);}.bind(this);this.fullResizeFn=function(c){this.fullscreenResize(c);
}.bind(this);}GalleryViewMask.prototype.open=function(){var a=this.fullscreenGetCoords();this.mask=new Mask(document.body,{hideOnClick:false,"class":"fullscreen_mask",style:{"z-index":"1000"},onClick:this.close.bind(this)});
this.mask.show();this.ctrEl=new Element("div",{"class":"fullscreen",styles:{position:this.fullScreenFixed?"fixed":"absolute","z-index":"1001",opacity:"0",left:a.left+"px",top:a.top+"px",width:a.width+"px",height:a.height+"px",margin:"0",padding:"0"}});
document.id(document.body).grab(this.ctrEl,"top");var b=new Element("a",{"class":"close_button",styles:{display:"block",position:"absolute","z-index":"1102",top:"0px",right:"0px",width:"33px",height:"33px"},events:{click:this.close.bind(this)}});
window.addEvent("keydown",this.fullKeydownFn);window.addEvent("resize",this.fullResizeFn);gallery_view_init(this.ctrEl,this.options,this.events);
this.ctrEl.getElement(".gallery").grab(b,"top");new Fx.Tween(this.ctrEl,{duration:500}).start("opacity",0,1);
if(this.events){_fire_event(this.events.onfullscreen,this.ctrEl._gallery,["",true]);}};GalleryViewMask.prototype.close=function(){if(this.animating){return;
}this.animating=true;new Fx.Tween(this.ctrEl,{duration:300,onComplete:function(){if(this.events){_fire_event(this.events.onfullscreen,this.ctrEl._gallery,["",false]);
}window.removeEvent("resize",this.fullResizeFn);window.removeEvent("keydown",this.fullKeydownFn);if(this.ctrEl._gallery){this.ctrEl._gallery.destroy();
}this.ctrEl.dispose();this.ctrEl=null;this.mask.destroy();this.mask=null;this.animating=false;}.bind(this)}).start("opacity",1,0);
};GalleryViewMask.prototype.fullscreenKeydown=function(a){switch(a.code){case 27:a.stop();setTimeout(this.close.bind(this),1);
break;case 37:case 40:a.stop();if(this.ctrEl._gallery){this.ctrEl._gallery.moveRelative(-1);}break;case 39:case 38:a.stop();
if(this.ctrEl._gallery){this.ctrEl._gallery.moveRelative(1);}break;}};GalleryViewMask.prototype.fullscreenResize=function(b){var a=this.fullscreenGetCoords();
this.ctrEl.setStyles({left:a.left+"px",top:a.top+"px",width:a.width+"px",height:a.height+"px"});if(this.ctrEl._gallery){this.ctrEl._gallery.layout();
}};GalleryViewMask.prototype.fullscreenGetCoords=function(){var c=window.innerWidth?{x:window.innerWidth,y:window.innerHeight}:window.getSize(),a=this.fullScreenFixed?{x:0,y:0}:window.getScroll(),f=Math.min(Math.round(c.x/40),Math.round(c.y/40));
var d=(a.x+f),e=(a.y+f),b=(c.x-(2*f)),g=(c.y-(2*f));return{left:d,top:e,width:Math.max(b,250),height:Math.max(g,250)};
};function gallery_view_init(b,c,d){b=document.id(b);if(b){var a=new GalleryView(b,c,d);a.init();b._gallery=a;
}return false;}function gallery_view_resize(a){a=document.id(a);if(a&&a._gallery){a._gallery.layout();
}return false;}function gallery_view_init_fullscreen(c,a,b){c=document.id(c);if(c){var d=a?Object.clone(a):{};
c.removeEvents("click");c.addEvent("click",function(){if(!d.startImage){var e=_get_image_src(c);if(e){var f=new URI(_clean_url(e)),g=f.getData("src");
if(g){d.startImage=g;}}}(new GalleryViewMask(d,b)).open();});}return false;}function gallery_view_init_all_fullscreen(c,a,b){var d=$$("."+c);
if(d.length>0){var a=a||{};a.images=a.images||[];d.each(function(j){var i=_get_image_src(j);if(i){var e=new URI(_clean_url(i)),l=e.getData("src");
if(l){var m=e.get("host")||"/",f=e.get("scheme")||"//",g=e.get("port");if(m!="/"){var n=f;if(f!="//"){n+="://";
}n+=m;if((g!="80")&&(g!="443")){n+=":"+g;}n+="/";}else{var n=m;}var h=j.title||j.alt;var k={server:n};
if(h){k.title=h;}Object.append(k,e.getData());a.images.push(k);if(!a.server){a.server=n;}}}});if(a.images.length>0){d.each(function(e){gallery_view_init_fullscreen(e,a,b);
});}}return false;}