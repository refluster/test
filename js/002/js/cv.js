/* HTML5 Canvas drag&drop
 * canvas is updated when an object is dragged by 1px
 */
var panelApl = {}; // namespace

(function($) {

    /* const */
    panelApl.con = {
	id: { // id name
	    cvm: 'cv1',  // main Canvas
	    cvdiv: 'cvdiv1',  // main Canvas��div
	    msgdiv: 'msg1',  // message display div
	    stbtn: 'stbtn1'  // start button
	},
	msg: { // instruction message
	    candr: 'movable',
	    dring: 'moving',
	    leave: 'dropped due to out of canvas',
	    pushb: 'press start button'
	},
	btnmsg: { // button message
	    start: 'start',
	    stop: 'stop'
	},
	dtype: { // figure
	    cir: 'circle',
	    tri: 'triangle',
	    squ: 'square'
	}
    };

    /* global var */
    // drag state
    panelApl.drag = {
	now: false, // true if dragging
	item: null  // index of itemAr of dragging item
    };
    panelApl.gamestart = false;  // true if playing

    /* button process
     * return: none
     */
    panelApl.start = function() {
	var $cvdiv = $('#' + panelApl.con.id.cvdiv); // main Canvas��div
	var $btn = $('#' + panelApl.con.id.stbtn); // start button
	if (!panelApl.gamestart) { // if not playing
	    // set events to the canvas
	    $cvdiv.mousedown(panelApl.cvmsDown);
	    $cvdiv.mouseup(panelApl.cvmsUp);
	    $cvdiv.mouseleave(panelApl.cvmsUp);
	    $cvdiv.mousemove(panelApl.cvmsMove);
	    // set smartphone events to the canvas
	    $cvdiv.bind("touchstart", panelApl.cvmsDown);
	    $cvdiv.bind("touchend", panelApl.cvmsUp);
	    $cvdiv.bind("touchend", panelApl.cvmsUp);
	    $cvdiv.bind("touchmove", panelApl.cvmsMove);
	    // init canvas
	    panelApl.DRAG.init();
	    panelApl.DRAG.draw();
	    
	    panelApl.gamestart = true;
	    panelApl.showmsg(panelApl.con.msg.candr);
	    $btn.text(panelApl.con.btnmsg.stop);
	} else { // if playing
	    // delete events from the canvas
	    $cvdiv.unbind('mousedown', panelApl.cvmsDown);
	    $cvdiv.unbind('mouseup', panelApl.cvmsUp);
	    $cvdiv.unbind('mouseleave', panelApl.cvmsUp);
	    $cvdiv.unbind('mousemove', panelApl.cvmsMove);
	    
	    panelApl.gamestart = false;
	    panelApl.showmsg(panelApl.con.msg.pushb);
	    $btn.text(panelApl.con.btnmsg.start);
	}
    };

    /* display message
     * {string} msg: displayed message
     * return: none
     */
    panelApl.showmsg = function(msg) {
	$('#' + panelApl.con.id.msgdiv).html(msg);
    };

    /* mousedown process
     * {event} evt: event obj
     * return: none
     */
    panelApl.cvmsDown = function(evt) {
	if (!panelApl.drag.now) {
	    // convert coordinate from point to canvas
	    var cx = evt.pageX - panelApl.DRAG.cvpos.x;
	    var cy = evt.pageY - panelApl.DRAG.cvpos.y;
	    // check if any object is at the point
	    var itemIdx = panelApl.DRAG.checkItem(cx, cy);
	    if (itemIdx != null) {
		panelApl.drag.now = true;
		panelApl.drag.item = itemIdx;
		panelApl.showmsg(panelApl.con.msg.dring);
	    }
	}
	return false;
    };
    /* mouseup/mouseleave process
     * {event} evt: event obj
     * return: none
     */
    panelApl.cvmsUp = function(evt) {
	if (panelApl.drag.now) {
	    // convert coordinate from point to canvas
	    var cx = evt.pageX - panelApl.DRAG.cvpos.x;
	    var cy = evt.pageY - panelApl.DRAG.cvpos.y;
	    if (cx < 0) cx = 0;
	    if (cx > panelApl.DRAG.area.w) cx = panelApl.DRAG.area.w;
	    if (cy < 0) cy = 0;
	    if (cy > panelApl.DRAG.area.h) cy = panelApl.DRAG.area.h;
	    // set item position to the center of the grid
	    //panelApl.DRAG.setCenter(panelApl.drag.item, cx, cy);
	    // update canvas
	    panelApl.DRAG.draw();
	    
	    panelApl.drag.now = false;
	    panelApl.drag.item = null;
	    if (evt.type == 'mouseleave'){
		panelApl.showmsg(panelApl.con.msg.leave);
	    } else if (panelApl.gamestart) {
		panelApl.showmsg(panelApl.con.msg.candr);
	    }
	}
    };
    /* mousemove process
     * {event} evt: evnet obj
     * return: none
     */
    panelApl.cvmsMove = function(evt) {
	if (panelApl.drag.now) {
	    // convert coordinate from point to canvas
	    var cx = evt.pageX - panelApl.DRAG.cvpos.x;
	    var cy = evt.pageY - panelApl.DRAG.cvpos.y;
	    // check if the canvas should be updated
	    var updSep = 1; // #. of pixels that canvas is updated if an object is moved by
	    if (Math.abs(cx - panelApl.DRAG.itemAr[panelApl.drag.item].x) >= updSep ||
		Math.abs(cy - panelApl.DRAG.itemAr[panelApl.drag.item].y) >= updSep) {
		// update the position of the item
		panelApl.DRAG.itemAr[panelApl.drag.item].x = cx;
		panelApl.DRAG.itemAr[panelApl.drag.item].y = cy;
		// update the canvas
		panelApl.DRAG.draw();
	    }
	}
	return false;
    };

    /* body onload process */
    $(window).load(function() {
	// get canvas's DOM element and context
	var canvas = document.getElementById(panelApl.con.id.cvm);
	if ( ! canvas || ! canvas.getContext ) { return false; }
	var ctx = canvas.getContext("2d");
	ctx.lineWidth = 1;
	ctx.globalAlpha = 0.7;
	ctx.globalCompositeOperation = "source-over";

	// display
	panelApl.DRAG = new canvasManager.canv(ctx, canvas.width, canvas.height, panelApl);
	panelApl.DRAG.init();
	panelApl.DRAG.draw();

	// set events
	var $btn = $('#' + panelApl.con.id.stbtn); // start button
	$btn.mousedown(panelApl.start);
	$btn.text(panelApl.con.btnmsg.start);
	
	// show message
	panelApl.showmsg(panelApl.con.msg.pushb);
    });


})(jQuery);
