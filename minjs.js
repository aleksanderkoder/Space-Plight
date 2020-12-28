const app = require('electron').remote; 
window.$ = window.jQuery = require('./jquery-3.5.1.min.js');

jQuery(function() {
    
    var beepSound = new Audio("Sound effects/Beep.mp3");
    var menuMusic = new Audio("Musikk/space_thickness_01.mp3");
    var masterVolume = 0.5; 
    beepSound.volume = masterVolume; 
    menuMusic.volume = masterVolume; 
    menuMusic.loop = true; 
    menuMusic.play();  

    // GLOBALE SPILLVERDIER OG VARIABLER
    var modifier = 7;
    const ASTEROIDEFART = 2;
    const SKUDDFART = 7; 
    const GAME_FPS = 60; 
    var score = 0; 
    var level = 1;
    var gameLoop;
    
    var astID = 0;  
    var astSpawnTicks = 0;   
    var asteroideListe = []; 

    // Array for tastetrykk
    var map = []; 

    // Variabler osv. til skudd
    var skuddID = 0; 
    var skuddListe = [];
    var kanSkyte = true;
    
    $("#btnStart").on("click", function(){
        menuMusic.pause();
        menuMusic.currentTime = 0;
        var countSound = new Audio("Sound effects/Countdown trimmed.mp3");
        countSound.volume = masterVolume; 
        countSound.play(); 
        document.getElementById("background").style.backgroundImage = 'url("Art assets/space_d.png")';
        $("#startmenu").hide();
        $("#startTimer").show();
        $("#startTimer").html("3");
        var timer = 2; 
        var intTimer = setInterval(function()
        {
            $("#startTimer").html(timer);
            timer--;
            if(timer < 0)
            {
                clearInterval(intTimer);
                $("#startTimer").hide();
                
                $("#deathscreen").hide();
                $("#startmenu").hide();
                $("#game").show();

                prepareGameLoop(GAME_FPS);
            } 
        }, 1000);
    }); 

    document.getElementById("MasterVolumeSlider").oninput = function() {
        masterVolume = document.getElementById("MasterVolumeSlider").value / 100; 
        menuMusic.volume = masterVolume; 
        beepSound.volume = masterVolume;
        console.log(masterVolume);
    }

    $("#btnOptTilbake").on("click", function(){
        $("#options").hide();
        $("#startmenu").show();
        beepSound.play(); 
    }); 

    $("#btnNewGame").on("click", function(){
        document.getElementById("background").style.backgroundImage = 'url("Art assets/space_d.png")';
        deathMusic.pause();
        deathMusic.currentTime = 0;
        var countSound = new Audio("Sound effects/Countdown trimmed.mp3");
        countSound.volume = masterVolume; 
        countSound.play(); 
        $("#deathscreen").hide();
        $("#startTimer").show();
        $("#startTimer").html("3");
        var timer = 2; 
        var intTimer = setInterval(function()
        {
            $("#startTimer").html(timer);
            timer--;
            if(timer < 0)
            {
                clearInterval(intTimer);
                $("#startTimer").hide();
                $("#deathscreen").hide();
                $("#startmenu").hide();
                $("#game").show();
 
                prepareGameLoop(GAME_FPS); 
            } 
        }, 1000);
    }); 

    $(".btnQuit").on("click", function(){
        app.getCurrentWindow().close(); 
    }); 

    $("#btnMainMenu").on("click", function(){
        menuMusic = new Audio("Musikk/space_thickness_01.mp3");
        menuMusic.volume = masterVolume; 
        menuMusic.play();  
        beepSound.play();
        deathMusic.pause();
        deathMusic.currentTime = 0;
        $("#deathscreen").hide();
        $("#startmenu").show();
    });

    $("#btnOptions").on("click", function(){
        $("#startmenu").hide();
        $("#options").show();
        beepSound.play();
    });

    function prepareGameLoop(fps) {
        fpsInterval = 1000 / fps;
        then = Date.now();
        startTime = then;

        score = 0; 
        level = 1;

        musikk = new Audio("Musikk/haunted_omamo_00.mp3");
        musikk.volume = masterVolume; 
        musikk.loop = true; 
        musikk.play();

        startGameLoop();
    }

    function startGameLoop() {

        // request another frame
        gameLoop = requestAnimationFrame(startGameLoop);
    
        // calc elapsed time since last loop
        now = Date.now();
        elapsed = now - then;
    
        // if enough time has elapsed, draw the next frame
        if (elapsed > fpsInterval) {
            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);
    
            // Kjører funksjoner hver frame (60 ganger i sekundet)
            sjekkTaster();
            sjekkKollidering();
            sjekkSkuddKollidering(); 
            scoreTeller(); 
            asteroideMomentum(); 
            levelCounter();
            skuddMomentum();
            asteroideSpawner();

            
        }
        
    }    
            
            window.addEventListener("keydown", (event) => {
                
                var keyFinnes = false; 
                for(var i = 0; i < map.length; i++) 
                    {
                        if(event.key == map[i])
                        {
                            keyFinnes = true; 
                        }
                    }
                    if(keyFinnes == false)
                    {
                        map.push(event.key);
                    }
                     
            });
    
            window.addEventListener("keyup", (event) => { 
                    
                    for(var i = 0; i < map.length; i++) 
                    {
                        if(event.key == map[i])
                        {
                            map.splice(i,1); 
                            console.log("fjernet noe");
                        }
                    }
            });

            var skuddLyd = new Audio("Sound Effects/Blaster.mp3");

            function sjekkTaster()
            {
                for(var i = 0; i < map.length; i++) 
                    {
                        if(map[i] == "ArrowUp")
                        {
                            var move = parseInt($("#player").css("top")); 
                            if(move >= 10)
                            {
                                move = parseInt(move - modifier);
                                $("#player").css("top", move + "px");
                                
                            }
                        }
                        else if(map[i] == "ArrowDown")
                        {
                            var move = parseInt($("#player").css("top"));
                            if(move <= 480)
                            {
                                move = move + modifier;
                                $("#player").css("top", move + "px"); 
                            } 
                        }
                        else if(map[i] == "ArrowLeft")
                        {
                            var move = parseInt($("#player").css("left"));
                            if(move >= 10)
                            { 
                                move = move - modifier;
                                $("#player").css("left", move + "px");
                            }
                        }
                        else if(map[i] == "ArrowRight")
                        {
                            var move = parseInt($("#player").css("left"));
                            if(move <= 730)
                            {
                                move = move + modifier;
                                $("#player").css("left", move + "px");
                            }
                        }
                        else if(map[i] == " ")
                        {
                            if(kanSkyte)
                            { 
                                skuddLyd.volume = masterVolume;
                                skuddLyd.play(); 
                                var playerX = parseInt($("#player").css("left"));
                                var playerY = parseInt($("#player").css("top"));
                                var skudd = document.createElement("div");
                                skudd.setAttribute("id", "skudd" + skuddID); 
                                skudd.setAttribute("class", "skudd");
                                skuddID++; 

                                skudd.style.top = playerY + 20 + "px";
                                skudd.style.left = playerX + 50 + "px";
                                document.body.appendChild(skudd);
                                skuddListe.push(skudd);
                                kanSkyte = false; 
                                setTimeout(function () {
                                    kanSkyte = true; 
                                }, 3000);
                            }
                            
                            
                        }
                    }
            }
             
            // Endrer bane og holder oversikt over banenummer
            var alarm = new Audio("Sound effects/Alarm 3.mp3"); 
            var warning = new Audio("Sound effects/Warning.mp3"); 
            var levelCounterTick = 0; 

            function levelCounter(){
                levelCounterTick++; 
                if(levelCounterTick >= 3600)
                {
                    levelCounterTick = 0; 
                    alarm.volume = masterVolume;
                    warning.volume = masterVolume; 
                    level++; 
                    $("#levelCounter").html("Level: " + level);
                    $("#levelCounter").removeClass("animated fadeInDown");
                    $("#levelCounter").addClass("animated heartBeat");
                    setTimeout(function () {
                        $("#background").removeClass("animated fadeIn");
                        $("#background").addClass("animated fadeOut");
                    }, 3200);
                    
                    alarm.play(); 

                    setTimeout(function (){
                        var randNummer = parseInt(Math.random() * 4); 
                        var bakgrunnListe2 = ["Art assets/space_y.png","Art assets/space_r.png","Art assets/space_p.png","Art assets/space_g.png"];
                        var imgnavn2 = 'url(' + '"' + bakgrunnListe2[randNummer] + '"' + ')';
                        document.getElementById("background").style.backgroundImage = imgnavn2;
                        $("#background").removeClass("animated fadeOut");
                        $("#background").addClass("animated fadeIn");
                        $("#levelCounter").removeClass("animated heartBeat");
                        warning.play(); 
                    }, 3500);
                }
                
            }

            // Sjekker kollidering i alle retninger
            var sjekkKolTicks = 0; 
            function sjekkKollidering(){
                sjekkKolTicks++;
                if(sjekkKolTicks >= 2)
                {
                    console.log("Kjører sjekkKollidering");
                    sjekkKolTicks = 0; 
                    var playerY = parseInt($("#player").css("top"));
                    var playerX = parseInt($("#player").css("left"));
                    
                    for(var i = 0; i < asteroideListe.length; i++)
                    {
                        var currentAsteroide = asteroideListe[i].id;
                        var elCurrentAsteroide = document.getElementById(currentAsteroide);  
                        
                        // Fjerner asteroide hvis den er utenfor venstre vindugrense
                        if(parseInt($("#" + currentAsteroide).css("left")) < -50)
                        {
                            elCurrentAsteroide.remove();
                            asteroideListe.splice(i,1);  
                            //console.log("Slettet asteroide fra array.");
                            continue;  
                        }
                        // Sjekker kollidering i retning opp
                        
                        var asteroideX = parseInt($("#" + currentAsteroide).css("left"));
                        
                        var asteroideY = parseInt($("#" + currentAsteroide).css("top"));
                        
                        if(playerX >= asteroideX && playerX < asteroideX + 50 && playerY == asteroideY + 50 || playerX < asteroideX && playerX > asteroideX - 50 && playerY == asteroideY + 50)
                        {
                            playerDead();
                            return; 
                        }
                        
                        // Sjekker kollidering i retning ned
                        playerY = parseInt($("#player").css("bottom"));
                        asteroideY = parseInt($("#" + currentAsteroide).css("bottom"));
                        
                        if(playerX >= asteroideX && playerX < asteroideX + 50 && playerY == asteroideY + 50 || playerX < asteroideX && playerX > asteroideX - 50 && playerY == asteroideY + 50)
                        { 
                            playerDead();
                            return; 
                        }
            
                        // Sjekker kollidering i retning høyre
                        playerX = parseInt($("#player").css("right"));
                        asteroideX = parseInt($("#" + currentAsteroide).css("right"));
                        playerY = parseInt($("#player").css("top"));
                        asteroideY = parseInt($("#" + currentAsteroide).css("top"));
                        
                        if(playerX >= asteroideX && playerX < asteroideX + 50 && playerY >= asteroideY &&  playerY < asteroideY + 50 || asteroideX >= playerX && asteroideX < playerX + 50 && asteroideY >= playerY && asteroideY < playerY + 50) 
                        { 
                            playerDead();
                            return;
                        }
            
                        // Sjekker kollidering i retning venstre
                        playerY = parseInt($("#player").css("bottom"));
                        asteroideY = parseInt($("#" + currentAsteroide).css("bottom"));
                        
                        if(playerX >= asteroideX && playerX < asteroideX + 50 && playerY >= asteroideY &&  playerY < asteroideY + 50 || asteroideX >= playerX && asteroideX < playerX + 50 && asteroideY >= playerY && asteroideY < playerY + 50) 
                        { 
                            playerDead(); 
                            return;
                        }
                    }  
                }
            }

            
            var sjekkSkuddKolTicks = 0;
            function sjekkSkuddKollidering(){
                sjekkSkuddKolTicks++;
                if(sjekkSkuddKolTicks >= 1)
                {
                    console.log("Kjører skuddkolsjekk");
                    sjekkSkuddKolTicks = 0; 
                    for(var i = 0; i < skuddListe.length; i++)  
                    {
                        var skuddX = parseInt($(skuddListe[i]).css("right"));
                        var skuddY = parseInt($(skuddListe[i]).css("top"));
                        if(skuddX < -50)
                        {
                            var CurrentSkudd = skuddListe[i].id; 
                            var elCurrentSkudd = document.getElementById(CurrentSkudd);
                            skuddListe.splice(i,1);
                            elCurrentSkudd.remove();
                            return; 
                        }

                        for(var j = 0; j < asteroideListe.length; j++)
                        {   
                            var asteroideX = parseInt($(asteroideListe[j]).css("right"));
                            var asteroideY = parseInt($(asteroideListe[j]).css("top"));

                            if(skuddX >= asteroideX && skuddX < asteroideX + 50 && skuddY >= asteroideY &&  skuddY < asteroideY + 50 || asteroideX >= skuddX && asteroideX < skuddX + 10 && asteroideY >= skuddY && asteroideY < skuddY + 10) 
                            {   
                                var expSound2 = new Audio("Sound effects/Explosion in space.mp3");
                                expSound2.volume = masterVolume;
                                expSound2.play(); 
                                var CurrentSkudd = skuddListe[i].id; 
                                var elCurrentSkudd = document.getElementById(CurrentSkudd); 
                                var CurrentAsteroid = asteroideListe[j].id; 
                                var elCurrentAsteroid = document.getElementById(CurrentAsteroid);     
                                skuddListe.splice(i,1);
                                asteroideListe.splice(j,1); 
                                elCurrentSkudd.remove(); 
                                elCurrentAsteroid.remove();
                                return;
                            }
                        }
                    }  
                }
            }
    
            var astSpawnSpeedup = 500; 
            function asteroideSpawner()
            {
                astSpawnTicks++;
                
                if(astSpawnTicks >= astSpawnSpeedup)
                {
                    astSpawnTicks = 0; 
                    if(astSpawnSpeedup > 40)
                    {
                        astSpawnSpeedup = astSpawnSpeedup * 0.82;
                    }
                    
                    var obj = document.createElement("div");
                    obj.setAttribute("id", "asteroide" + astID); 
                    obj.setAttribute("class", "asteroide");
                    var bakgrunnListe = ["Art assets/asteroide 1.png","Art assets/asteroide 2.png","Art assets/asteroide 3.png"];
                    obj.style.backgroundImage = 'url(' + '"' + bakgrunnListe[parseInt(Math.random() * 3)] + '"' + ')';
                    obj.style.right = -50 + "px";
                    obj.style.top = Math.random() * 500 + "px"; 
                    astID++;
                    asteroideListe.push(obj);     
                    document.body.appendChild(obj); 
                }
                
            }
     
            function asteroideMomentum(){
                for(i = 0; i < asteroideListe.length; i++)
                {
                    //console.log("asteroide beveger seg");
                    var move = parseInt(asteroideListe[i].style.right);
                    move = move + ASTEROIDEFART;
                    asteroideListe[i].style.right = move + "px";  
                } 
            }

            function skuddMomentum(){ 
                    for(i = 0; i < skuddListe.length; i++)
                    {
                        var move = parseInt(skuddListe[i].style.left);
                        move = move + SKUDDFART;
                        skuddListe[i].style.left = move + "px";  
                    }     
            }
            
            function scoreTeller(){
                document.getElementById("score").innerHTML = "Score: " + score;
                score += 1;  
            }

            function playerDead(){
                cancelAnimationFrame(gameLoop);

                musikk.pause();
                musikk.currentTime = 0;
                var expSound = new Audio("Sound effects/Explosion in space.mp3");
                expSound.volume = masterVolume; 
                expSound.play();

                deathMusic = new Audio("Musikk/sleep fade in.mp3");
                deathMusic.volume = masterVolume; 
                deathMusic.play(); 
                $("#game").hide(); 
                  
                document.querySelectorAll('.asteroide').forEach(ast => ast.remove());
                document.querySelectorAll('.skudd').forEach(sku => sku.remove());
                asteroideListe = [];
                skuddListe = [];  
                astSpawnSpeedup = 500; 
                levelCounterTick = 0; 

                $("#deathscreen").show();
                $("#levelCounter").html("Level: 1"); 
                $("#h2showFinalScore").html("Your score: " + score);
                $("#h2showFinalLevel").html("You got to level " + level);
                $("#player").css("top", "250px"); 
                $("#player").css("left", "370px"); 
                
            }
     
}); 
