// ===== Sentiment Analysis =====

const positiveWords=[
"tốt","tuyệt","hài lòng","excellent","good","amazing",
"great","love","perfect","nhanh","đẹp","thích"
];

const negativeWords=[
"tệ","xấu","bad","terrible","hate","poor",
"chậm","thất vọng","tồi","kém"
];

function analyze(){

let text=document.getElementById("textInput").value;

let loading=document.getElementById("loading");
let result=document.getElementById("result");

if(text.trim()===""){
alert("Vui lòng nhập phản hồi khách hàng");
return;
}

loading.classList.remove("hidden");
result.classList.add("hidden");

setTimeout(()=>{

let score=50;

let lowerText=text.toLowerCase();

positiveWords.forEach(word=>{
if(lowerText.includes(word)) score+=10;
});

negativeWords.forEach(word=>{
if(lowerText.includes(word)) score-=10;
});

if(score>100) score=100;
if(score<0) score=0;

let stars=Math.round(score/20);

let status="";
let emoji="";
let color="";

if(score>=80){

status="🟢 Rất tích cực";
emoji="😍";
color="#16a34a";

}

else if(score>=60){

status="😊 Tích cực";
emoji="😀";
color="#22c55e";

}

else if(score>=40){

status="😐 Trung lập";
emoji="🙂";
color="#eab308";

}

else if(score>=20){

status="😕 Tiêu cực";
emoji="😞";
color="#f97316";

}

else{

status="😡 Rất tiêu cực";
emoji="😡";
color="#ef4444";

}

let starIcons="";

for(let i=0;i<stars;i++){
starIcons+="⭐";
}

document.getElementById("emoji").innerHTML=emoji;

document.getElementById("status").innerHTML=status;

document.getElementById("status").style.color=color;

document.getElementById("score").innerHTML=score;

document.getElementById("stars").innerHTML=starIcons;

document.getElementById("scoreFill").style.width=score+"%";

loading.classList.add("hidden");

result.classList.remove("hidden");

},1200);

}

function copyResult(){

let status=document.getElementById("status").innerText;
let score=document.getElementById("score").innerText;
let stars=document.getElementById("stars").innerText;

if(score===""){
alert("Chưa có kết quả");
return;
}

let text=`Kết quả phân tích:

${status}
Điểm: ${score}/100
Đánh giá: ${stars}
`;

navigator.clipboard.writeText(text);

alert("Đã copy kết quả");

}


// ===== Particle Background =====

const canvas=document.getElementById("particles");

const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let particles=[];

for(let i=0;i<60;i++){

particles.push({

x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*3,
speedX:(Math.random()-0.5)*0.5,
speedY:(Math.random()-0.5)*0.5

});

}

function animateParticles(){

ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{

p.x+=p.speedX;
p.y+=p.speedY;

ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);

ctx.fillStyle="rgba(255,255,255,0.6)";
ctx.fill();

});

requestAnimationFrame(animateParticles);

}

animateParticles();