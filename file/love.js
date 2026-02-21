(function(window){

    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function bezier(cp, t) {  
        var p1 = cp[0].mul((1 - t) * (1 - t));
        var p2 = cp[1].mul(2 * t * (1 - t));
        var p3 = cp[2].mul(t * t); 
        return p1.add(p2).add(p3);
    }  

    function inheart(x, y, r) {
        var z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) ** 3 - (x / r) ** 2 * (y / r) ** 3;
        return z < 0;
    }

    Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype = {
        clone: function() {
            return new Point(this.x, this.y);
        },
        add: function(o) {
            var p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function(o) {
            var p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function(n) {
            var p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function(n) {
            var p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    }

    Heart = function() {
        var points = [], x, y, t;
        for (var i = 10; i < 30; i += 0.2) {
            t = i / Math.PI;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
    }
    Heart.prototype = {
        get: function(i, scale) {
            return this.points[i].mul(scale || 1);
        }
    }

    Seed = function(tree, point, scale, color) {
        this.tree = tree;
        var scale = scale || 1;
        var color = color || '#FFC0CB';

        this.heart = {
            point  : point,
            scale  : scale,
            color  : color,
            figure : new Heart(),
        }

        this.cirle = {
            point  : point,
            scale  : scale,
            color  : color,
            radius : 26,
        }
    }
    Seed.prototype = {
        draw: function() {
            this.drawHeart();
            this.drawText();
        },
        addPosition: function(x, y) {
            this.cirle.point = this.cirle.point.add(new Point(x, y));
        },
        canMove: function() {
            return this.cirle.point.y < (this.tree.height + 20); 
        },
        move: function(x, y) {
            this.clear();
            this.drawCirle();
            this.addPosition(x, y);
        },
        canScale: function() {
            return this.heart.scale > 0.2;
        },
        setHeartScale: function(scale) {
            this.heart.scale *= scale;
        },
        scale: function(scale) {
            this.clear();
            this.drawCirle();
            this.drawHeart();
            this.setHeartScale(scale);
        },
        drawHeart: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, scale = heart.scale;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < heart.figure.length; i++) {
                var p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawCirle: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, color = cirle.color, scale = cirle.scale, radius = cirle.radius;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        },
        drawText: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, scale = heart.scale;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
            ctx.lineTo(15, 15);
            ctx.lineTo(130, 15);
            ctx.stroke();

            ctx.moveTo(0, 0);
            ctx.scale(0.75, 0.75);
            ctx.font = "12px Verdana";
            ctx.fillText("Click Me:) ", 30, -5);
            ctx.fillText("Birthday Queen !", 28, 10);
            ctx.restore();
        },
        clear: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, scale = cirle.scale, radius = cirle.radius;
            var w = h = radius * scale;
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function(x, y) {
            // ✅ Fixed: distance-based hover detection
            var dx = x - this.cirle.point.x;
            var dy = y - this.cirle.point.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= this.cirle.radius * this.heart.scale;
        }
    }

    Footer = function(tree, width, height, speed) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width;
        this.height = height;
        this.speed = speed || 2;
        this.length = 0;
    }
    Footer.prototype = {
        draw: function() {
            var ctx = this.tree.ctx, point = this.point;
            var len = this.length / 2;
            ctx.save();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(len, 0);
            ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();
            if (this.length < this.width) this.length += this.speed;
        }
    }

    Tree = function(canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};
        this.record = {};
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
        this.initClick();
    }
    Tree.prototype = {
        initSeed: function() {
            var seed = this.opt.seed || {};
            var x = seed.x || this.width / 2;
            var y = seed.y || this.height / 2;
            var point = new Point(x, y);
            var color = seed.color || '#FF69B4';
            var scale = seed.scale || 1;
            this.seed = new Seed(this, point, scale, color);
        },
        initFooter: function() {
            var footer = this.opt.footer || {};
            var width = footer.width || this.width;
            var height = footer.height || 5;
            var speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        },
        initBranch: function() {
            this.branchs = [];
            var branchs = this.opt.branch || [];
            this.addBranchs(branchs);
        },
        initBloom: function() {
            var bloom = this.opt.bloom || {};
            var cache = [], num = bloom.num || 500;
            var width = bloom.width || this.width;
            var height = bloom.height || this.height;
            var figure = this.seed.heart.figure;
            for (var i = 0; i < num; i++) {
                cache.push(this.createBloom(width, height, 240, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },

        initClick: function() {
            // ✅ Handle desktop and mobile clicks
            var self = this;
            this.canvas.addEventListener('click', function(e){
                var rect = self.canvas.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                if(self.seed.hover(x, y)){
                    self.seed.scale(1.2);
                }
            });
            this.canvas.addEventListener('touchstart', function(e){
                var rect = self.canvas.getBoundingClientRect();
                var touch = e.touches[0];
                var x = touch.clientX - rect.left;
                var y = touch.clientY - rect.top;
                if(self.seed.hover(x, y)){
                    self.seed.scale(1.2);
                }
            });
        },

        addBranch: function(branch) { this.branchs.push(branch); },
        addBranchs: function(branchs) {
            for(var i=0;i<branchs.length;i++){
                var b = branchs[i];
                this.addBranch(new Branch(this, new Point(b[0],b[1]), new Point(b[2],b[3]), new Point(b[4],b[5]), b[6], b[7], b[8]));
            }
        },
        removeBranch: function(branch){
            var idx = this.branchs.indexOf(branch);
            if(idx!=-1) this.branchs.splice(idx,1);
        },
        canGrow: function(){ return !!this.branchs.length; },
        grow: function(){ this.branchs.forEach(b => b.grow()); },

        addBloom: function(bloom){ this.blooms.push(bloom); },
        removeBloom: function(bloom){ 
            var idx = this.blooms.indexOf(bloom); 
            if(idx!=-1) this.blooms.splice(idx,1); 
        },
        createBloom: function(width, height, radius, figure){
            while(true){
                var x = random(20,width-20);
                var y = random(20,height-20);
                if(inheart(x-width/2,height-(height-40)/2-y,radius)){
                    return new Bloom(this,new Point(x,y),figure);
                }
            }
        }
    }

    Branch = function(tree,p1,p2,p3,radius,length,branchs){
        this.tree = tree;
        this.point1 = p1;
        this.point2 = p2;
        this.point3 = p3;
        this.radius = radius;
        this.length = length||100;
        this.len=0;
        this.t=1/(this.length-1);
        this.branchs=branchs||[];
    }
    Branch.prototype.grow = function(){
        if(this.len <= this.length){
            var p = bezier([this.point1,this.point2,this.point3], this.len*this.t);
            this.draw(p);
            this.len++;
            this.radius *= 0.97;
        } else {
            this.tree.removeBranch(this);
            this.tree.addBranchs(this.branchs);
        }
    }
    Branch.prototype.draw = function(p){
        var ctx = this.tree.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = '#FFC0CB';
        ctx.shadowBlur=2;
        ctx.arc(p.x,p.y,this.radius,0,2*Math.PI);
        ctx.fill();
        ctx.restore();
    }

    Bloom = function(tree, point, figure, color, alpha, angle, scale, place, speed){
        this.tree = tree;
        this.point = point;
        this.figure = figure;
        this.color = color || 'rgb(255,'+random(0,255)+','+random(0,255)+')';
        this.alpha = alpha || random(0.3,1);
        this.angle = angle || random(0,360);
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;
    }
    Bloom.prototype.draw = function(){
        var ctx = this.tree.ctx;
        ctx.save();
        ctx.fillStyle=this.color;
        ctx.globalAlpha=this.alpha;
        ctx.translate(this.point.x,this.point.y);
        ctx.scale(this.scale,this.scale);
        ctx.rotate(this.angle);
        ctx.beginPath();
        for(var i=0;i<this.figure.length;i++){
            var p=this.figure.get(i);
            ctx.lineTo(p.x,-p.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    window.random = random;
    window.bezier = bezier;
    window.Point = Point;
    window.Tree = Tree;

})(window);
