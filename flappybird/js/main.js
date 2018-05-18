// 游戏配置
var config = {
    type: Phaser.AUTO,
    width: 288,
    height: 505,
    // 设置重力
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
var platforms,play,ground,ground2,bg = null
var OVER = false
var groundSpeed = 0
var bgSpeed = 0
var platformsSpeed = -200
var pipesW = 54
var pipesX = config.width
var rd,topY,bottomY;
var game = new Phaser.Game(config);
// 预加载
function preload() {
    // 加载图片资源
    this.load.image('background','assets/background.png')
    this.load.image('ground','assets/ground.png')
    this.load.image('gameover','assets/gameover.png')
    this.load.image('get-ready','assets/get-ready.png')
    //加载音效
    this.load.audio('ground-hit','assets/ground-hit.wav')
    this.load.audio('pipe-hit','assets/pipe-hit.wav')
    this.load.audio('flap','assets/flap.wav')
    this.load.audio('ouch','assets/ouch.wav')
    //加载雪碧图资源
    this.load.spritesheet('pipes','assets/pipes.png',{frameWidth:pipesW,frameHeight:320})
    this.load.spritesheet('bird','assets/bird.png',{frameWidth:34,frameHeight:24})

}
function createPipes(){
    /** 水管创建范围
     * x 100-135 y 上-30-30,下390-450 
     */
     rd = Phaser.Math.Between(100,135)
     topY = Phaser.Math.Between(-40,20)
     bottomY = Phaser.Math.Between(390,440)
     pipesX+=rd
     
    //上水管
    platforms.create(pipesX,topY,"pipes")
    //下水管
    platforms.create(pipesX,bottomY,"pipes",1)

    
    //循环子组件设置重力为false
    platforms.children.iterate(function(child){
        child.body.allowGravity = false;
    })

    if(platforms.children.size<4){
        createPipes()
    }
}

function updatePipes(){
    platforms.children.iterate(function(child){
        if(child.body.x< -pipesW){
            topY = Phaser.Math.Between(-40,20)
            bottomY = Phaser.Math.Between(390,440)
            if(child.body.y<20){

                child.body.reset(config.width,topY)

            }else{

                child.body.reset(config.width,bottomY)

            }
        }
    })
    platforms.setVelocityX(platformsSpeed)       
}

// 加载完成执行
function create() {
    // 添加背景进画布
    bg = this.add.tileSprite(config.width/2, config.height/2, config.width, config.height, 'background')

    //添加物理物体组
    
    platforms = this.physics.add.group()
    platforms.enableBody = true;
    
    createPipes()
    //添加静态物理精灵
    ground = this.add.tileSprite(config.width-335/2, config.height-112/2,335,112, 'ground')
    ground = this.physics.add.existing(ground, 'staticSprite')
    //添加有重力的游戏角色
    player = this.physics.add.sprite(100,100,'bird')

    //设置碰撞回弹值
    // player.setBounce(0.2);
    //设置重力边界
    player.setCollideWorldBounds(true);

    //添加动画
    this.anims.create({
        key:'fly',
        frames:this.anims.generateFrameNumbers('bird',{start : 0,end : 2}),
        frameRate:10,
        repeat:-1,
    })

    // 角色飞行动画   
    player.anims.play('fly')
}

function gameOver(){
    OVER = true
    player.anims.stop('fly')
    platforms.setVelocityX(0) 
    // console.log('gameOver')
}
//  更新函数
function update() {
    var that = this

    // 背景地面无限滚动
    if(!OVER){
        bgSpeed+=0.5
        groundSpeed+=5

        bg.tilePositionX =  bgSpeed
        ground.tilePositionX =  groundSpeed
        updatePipes()
    }


    //添加碰撞
    this.physics.add.overlap(player,platforms,function(){
        if(OVER) return;
        that.sound.play('pipe-hit')
        gameOver()
        console.log('与管道重叠了 ')
    })
    this.physics.add.collider(player,ground,function(){
        if(OVER) return;
        that.sound.play('ground-hit')
        gameOver()
        console.log('碰撞了地面')
    })

    //添加按下事件监听
    this.input.on('pointerdown', function(pointer, currentlyOver){
        if(OVER) return;
        // that.sound.play('flap')
        that.tweens.add({
            targets: player,
            duration:50,
            angle:-30,
        })
        //设置角色Y轴速度
        player.setVelocityY(-200)     
    });

    //判断角色下降角度
    if(player.angle < 90) player.angle += 2.5;

}