var Apl = function() {
	this.simulating = false;
	this.timer = $.timer();
	this.fps = 60;

	var $canvas = $('#canvas');
	if ( ! $canvas[0] || ! $canvas[0].getContext ) { return false; }
	this.ctx = $canvas[0].getContext("2d");
	this.ctx.globalCompositeOperation = "source-over";

	// canvas
	this.canvasWidth = $canvas.width();
	this.canvasHeight = $canvas.height();
	this.PI2 = Math.PI * 2; // 2*pi

	// set the position of the canvas on the browser
	var $cvdiv = $('#canvas');
	this.canvasLeft = $cvdiv.offset().left;
	this.canvasTop = $cvdiv.offset().top;

	// environment parameter
	this.radius = 1; // raduis of balls
	this.particles = [];
	this.sph;

	this.init();
	this.draw();

	// set events
	var $btn = $('#stbtn1'); // start button
	$btn.mousedown(this.start.bind(this));
	$btn.text('start');

	var count = 0;
	var dateOrigin = new Date();

	this.timer.set({
		action: function() {
			count ++;
			if (count == 400) {
				console.log(new Date() - dateOrigin);
			}
			this.moveObj();
			this.draw();
		}.bind(this),
		time: 1000/this.fps
	});
};

Apl.prototype.start = function() {
	var $btn = $('#stbtn1'); // start button

	if (!this.simulating) { // if not playing
		// init canvas
		this.init();
		this.simulating = true;
		this.timer.play();
		$btn.text('stop');
	} else { // if playing
		this.simulating = false;
		this.timer.pause();
		$btn.text('start');
	}
};

Apl.prototype.init = function() {
	this.sph = new Sph();
	this.sph.init();
};

Apl.prototype.moveObj = function() {
	this.sph.step();
};

Apl.prototype.draw = function() {
	this.ctx.fillStyle = '#000000';
	this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

	this.ctx.fillStyle = '#aaaaff';
	var p = this.sph.get_particle();
	for (var i = 0; i < p.length; i++) {
        this.ctx.fillRect(p[i].pos.x*8 - this.radius,
						  this.canvasHeight - p[i].pos.y*8,
						  this.radius*2, this.radius*2);
	}
};

$(function() {
    var apl = new Apl();
});
