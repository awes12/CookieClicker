//Most of this code is just copied from the cookie clicker main.js (I just modified them a bit)
//use summonWrinklersSetMax() to summon the wrinklers, then modify the wrinklersPerRow till it looks good
Game.wrinklersPerRow = 200; //the wrinklers per circle (used in my getPos method)
//this one's mine
function summonWrinklersSetMax(amount, forceShiny = false){
  Game.setWrinklerMax(amount, forceShiny);
  for (var i = 0; i < window.wrinklerMax; i++) Game.SpawnWrinkler(false, true);
}
//from cookie clicker, modified to have a custom max
Game.getWrinklersMax = function () {
  var n = window.wrinklerMax ?? 10;
  if (Game.Has('Elder spice')) n += 2;
  return n;
}
//from cookie clicker, modified to forceRare
Game.SpawnWrinkler = function (me, forceRare = false) {
  if (!me) {
    var max = Game.getWrinklersMax();
    var n = 0;
    for (var i in Game.wrinklers) {
      if (Game.wrinklers[i].phase > 0) n++;
    }
    for (var i in Game.wrinklers) {
      var it = Game.wrinklers[i];
      if (it.phase == 0 && Game.elderWrath > 0 && n < max && it.id < max) {
        me = it;
        break;
      }
    }
  }
  if (!me) return false;
  me.phase = 1;
  me.hp = Game.wrinklerHP;
  me.type = 0;
  if (Math.random() < 0.0001 || forceRare) me.type = 1;//shiny wrinkler
  return me;
}
//this one's mine
Game.setWrinklerMax = (num, resetWrinklers = false) => {
  window.wrinklerMax = num;
  Game.wrinklers = new Array(window.wrinklerMax).fill(e => []);
  if (resetWrinklers) {
    Game.ResetWrinklers();
  }
};

//changes the wrinklers position based on the index
Game.getPos = function(xBase, yBase, rad, bigCookieSize, index){
  return [xBase + Math.sin(rad)*bigCookieSize*(1+Math.floor(index / Game.wrinklersPerRow)),yBase+Math.cos(rad)*bigCookieSize*(1+Math.floor(index / Game.wrinklersPerRow))];
}

//copied from cookie clicker for use in the UpdateWrinklers function
function inRect(x,y,rect)
		{
			//find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
			//I found this somewhere online I guess
			var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
			var h1 = Math.sqrt(dx*dx + dy*dy);
			var currA = Math.atan2(dy,dx);
			var newA = currA - rect.r;
			var x2 = Math.cos(newA) * h1;
			var y2 = Math.sin(newA) * h1;
			if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
			return false;
		}
//from cookie clicker, modified to use a getPosition function
Game.UpdateWrinklers=function()
		{
      var max=Game.getWrinklersMax();
      if(Game.wrinklersPerRow == 0 || Game.wrinklersPerRow == undefined){
        Game.wrinklersPerRow = max;
      }
			var xBase=0;
			var yBase=0;
			var onWrinkler=0;
			if (Game.LeftBackground)
			{
				xBase=Game.cookieOriginX;
				yBase=Game.cookieOriginY;
			}
			var n=0;
			for (var i in Game.wrinklers)
			{
				if (Game.wrinklers[i].phase>0) n++;
			}
			for (var i in Game.wrinklers)
			{
				var me=Game.wrinklers[i];
				if (me.phase==0 && Game.elderWrath>0 && n<max && me.id<max)
				{
					var chance=0.00001*Game.elderWrath;
					chance*=Game.eff('wrinklerSpawn');
					if (Game.Has('Unholy bait')) chance*=5;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('scorn');
						if (godLvl==1) chance*=2.5;
						else if (godLvl==2) chance*=2;
						else if (godLvl==3) chance*=1.5;
					}
					if (Game.Has('Wrinkler doormat')) chance=0.1;
					if (Math.random()<chance)//respawn
					{
						Game.SpawnWrinkler(me);
					}
				}
				if (me.phase>0)
				{
					if (me.close<1) me.close+=(1/Game.fps)/10;
					if (me.close>1) me.close=1;
					if (me.id>=max) me.hp=0;
				}
				else me.close=0;
				if (me.close==1 && me.phase==1)
				{
					me.phase=2;
					Game.recalculateGains=1;
				}
				if (me.phase==2)
				{
					me.sucked+=(((Game.cookiesPs/Game.fps)*Game.cpsSucked));//suck the cookies
				}
				if (me.phase>0)
				{
					if (me.type==0)
					{
						if (me.hp<Game.wrinklerHP) me.hp+=0.04;
						me.hp=Math.min(Game.wrinklerHP,me.hp);
					}
					else if (me.type==1)
					{
						if (me.hp<Game.wrinklerHP*3) me.hp+=0.04;
						me.hp=Math.min(Game.wrinklerHP*3,me.hp);
					}
					var d=128*(2-me.close);//*Game.BigCookieSize;
					if (Game.prefs.fancy) d+=Math.cos(Game.T*0.05+parseInt(me.id))*4;
					me.r=(me.id/Game.wrinklersPerRow)*360;
					if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.05+parseInt(me.id))*4;
          
          let pos = Game.getPos(xBase, yBase, me.r*Math.PI/180, d, i);
                                    
					me.x=pos[0];
					me.y=pos[1];
					if (Game.prefs.fancy) me.r+=Math.sin(Game.T*0.09+parseInt(me.id))*4;
					var rect={w:100,h:200,r:(-me.r)*Math.PI/180,o:10};
					if (Math.random()<0.01 && !Game.prefs.notScary) me.hurt=Math.max(me.hurt,Math.random());
					if (Game.T%5==0 && Game.CanClick) {if (Game.LeftBackground && Game.mouseX<Game.LeftBackground.canvas.width && inRect(Game.mouseX-me.x,Game.mouseY-me.y,rect)) me.selected=1; else me.selected=0;}
					if (me.selected && onWrinkler==0 && Game.CanClick)
					{
						me.hurt=Math.max(me.hurt,0.25);
						//me.close*=0.99;
						if (Game.Click && Game.lastClickedEl==l('backgroundLeftCanvas'))
						{
							if (Game.keys[17] && Game.sesame) {me.type=!me.type;PlaySound('snd/shimmerClick.mp3');}//ctrl-click on a wrinkler in god mode to toggle its shininess
							else
							{
								Game.playWrinklerSquishSound();
								me.clicks++;
								if (me.clicks>=50) Game.Win('Wrinkler poker');
								me.hurt=1;
								me.hp-=0.75;
								if (Game.prefs.particles && !Game.prefs.notScary && !Game.WINKLERS && !(me.hp<=0.5 && me.phase>0))
								{
									var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
									var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
									for (var ii=0;ii<3;ii++)
									{
										//Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
										var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
										part.r=-me.r;
									}
								}
							}
							Game.Click=0;
						}
						onWrinkler=1;
					}
				}
				
				if (me.hurt>0)
				{
					me.hurt-=5/Game.fps;
					//me.close-=me.hurt*0.05;
					//me.x+=Math.random()*2-1;
					//me.y+=Math.random()*2-1;
					me.r+=(Math.sin(Game.T*1)*me.hurt)*18;//Math.random()*2-1;
				}
				if (me.hp<=0.5 && me.phase>0)
				{
					Game.playWrinklerSquishSound();
					PlaySound('snd/pop'+Math.floor(Math.random()*3+1)+'.mp3',0.75);
					Game.wrinklersPopped++;
					Game.recalculateGains=1;
					me.phase=0;
					me.close=0;
					me.hurt=0;
					me.hp=3;
					var toSuck=1.1;
					if (Game.Has('Sacrilegious corruption')) toSuck*=1.05;
					me.sucked*=1+Game.auraMult('Dragon Guts')*0.2;
					if (me.type==1) toSuck*=3;//shiny wrinklers are an elusive, profitable breed
					me.sucked*=toSuck;//cookie dough does weird things inside wrinkler digestive tracts
					if (Game.Has('Wrinklerspawn')) me.sucked*=1.05;
					if (Game.hasGod)
					{
						var godLvl=Game.hasGod('scorn');
						if (godLvl==1) me.sucked*=1.15;
						else if (godLvl==2) me.sucked*=1.1;
						else if (godLvl==3) me.sucked*=1.05;
					}
					if (me.sucked>0.5)
					{
						Game.Notify(me.type==1?loc("Exploded a shiny wrinkler"):loc("Exploded a wrinkler"),loc("Found <b>%1</b>!",loc("%1 cookie",LBeautify(me.sucked))),[19,8],6);
						Game.Popup('<div style="font-size:80%;">'+loc("+%1!",loc("%1 cookie",LBeautify(me.sucked)))+'</div>',Game.mouseX,Game.mouseY);
						
						if (Game.season=='halloween')
						{
							//if (Math.random()<(Game.HasAchiev('Spooky cookies')?0.2:0.05))//halloween cookie drops
							var failRate=0.95;
							if (Game.HasAchiev('Spooky cookies')) failRate=0.8;
							if (Game.Has('Starterror')) failRate*=0.9;
							failRate*=1/Game.dropRateMult();
							if (Game.hasGod)
							{
								var godLvl=Game.hasGod('seasons');
								if (godLvl==1) failRate*=0.9;
								else if (godLvl==2) failRate*=0.95;
								else if (godLvl==3) failRate*=0.97;
							}
							if (me.type==1) failRate*=0.9;
							if (Math.random()>failRate)//halloween cookie drops
							{
								var cookie=choose(['Skull cookies','Ghost cookies','Bat cookies','Slime cookies','Pumpkin cookies','Eyeball cookies','Spider cookies']);
								if (!Game.HasUnlocked(cookie) && !Game.Has(cookie))
								{
									Game.Unlock(cookie);
									Game.Notify(Game.Upgrades[cookie].dname,loc("You also found <b>%1</b>!",Game.Upgrades[cookie].dname),Game.Upgrades[cookie].icon);
								}
							}
						}
						Game.DropEgg(0.98);
					}
					if (me.type==1) Game.Win('Last Chance to See');
					Game.Earn(me.sucked);
					/*if (Game.prefs.particles && !Game.WINKLERS)
					{
						var x=me.x+(Math.sin(me.r*Math.PI/180)*100);
						var y=me.y+(Math.cos(me.r*Math.PI/180)*100);
						for (var ii=0;ii<6;ii++)
						{
							Game.particleAdd(x+Math.random()*50-25,y+Math.random()*50-25,Math.random()*4-2,Math.random()*-2-2,1,1,2,'wrinklerBits.png');
						}
					}*/
					if (Game.prefs.particles)
					{
						var x=me.x+(Math.sin(me.r*Math.PI/180)*90);
						var y=me.y+(Math.cos(me.r*Math.PI/180)*90);
						if (me.sucked>0)
						{
							for (var ii=0;ii<5;ii++)
							{
								Game.particleAdd(Game.mouseX,Game.mouseY,Math.random()*4-2,Math.random()*-2-2,Math.random()*0.5+0.75,1.5,2);
							}
						}
						if (!Game.prefs.notScary && !Game.WINKLERS)
						{
							for (var ii=0;ii<8;ii++)
							{
								var part=Game.particleAdd(x,y,Math.random()*4-2,Math.random()*-2-2,1,1,2,me.type==1?'shinyWrinklerBits.png':'wrinklerBits.png');
								part.r=-me.r;
							}
						}
					}
					me.sucked=0;
				}
			}
			if (onWrinkler)
			{
				Game.mousePointer=1;
            }
        }


summonWrinklersSetMax(1000, true);
