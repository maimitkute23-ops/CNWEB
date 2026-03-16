let stats = {
positive:0,
neutral:0,
negative:0
};

const button = document.getElementById("analyzeBtn");

button.addEventListener("click", analyzeText);

async function analyzeText(){

const text = document.getElementById("feedback").value;

if(text===""){
alert("Vui lòng nhập phản hồi");
return;
}

try{

const response = await fetch(
"https://api.groq.com/openai/v1/chat/completions",
{
method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer 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"
},

body:JSON.stringify({

model:"llama-3.1-8b-instant",

messages:[
{
role:"user",

content:`

Analyze this customer feedback:

${text}

Return ONLY valid JSON.
Do not explain anything.

{
"sentiment":"positive/neutral/negative",
"score":0,
"highlight":"",
"aspect":{
"product":"",
"delivery":"",
"price":""
},
"insight":"",
"recommendation":""
}

score must be between -1 and 1

`

}

]

})

}

);

const data = await response.json();

console.log("API RESPONSE:",data);

/* kiểm tra lỗi API */

if(!data.choices){
console.error(data);
alert("API returned error");
return;
}

/* lấy kết quả */

let result = data.choices[0].message.content.trim();

/* FIX: Groq đôi khi trả text + json */

const match = result.match(/{[\s\S]*}/);

if(match){
result = match[0];
}

displayResult(result);

}

catch(error){

console.error("API ERROR:",error);

alert("AI API error");

}

}

function displayResult(result){

let obj;

try{

obj = JSON.parse(result);

}catch(e){

console.log("RAW RESULT:",result);

alert("AI trả dữ liệu không đúng JSON");

return;

}

/* đổi sentiment sang tiếng Việt */

let sentimentText="";

if(obj.sentiment==="positive"){
sentimentText="Tích cực";
}
else if(obj.sentiment==="negative"){
sentimentText="Tiêu cực";
}
else{
sentimentText="Trung tính";
}

document.getElementById("sentiment").innerText =
"Cảm xúc: "+sentimentText;

/* chuyển điểm sang thang 1 → 5 */

let starScore = Math.round((obj.score + 1) * 2) + 1;

document.getElementById("score").innerText =
"Đánh giá: "+starScore+"/5";

document.getElementById("stars").innerText =
getStars(obj.score);

setMeter(obj.score);

/* highlight */

document.getElementById("highlight").innerHTML =
highlightEmotion(obj.highlight);

/* aspect */

document.getElementById("product").innerText =
obj.aspect.product;

document.getElementById("delivery").innerText =
obj.aspect.delivery;

document.getElementById("price").innerText =
obj.aspect.price;

/* insight (nếu AI trả rỗng thì tạo nội dung mặc định) */

let insightText =
obj.insight && obj.insight.trim() !== ""
? obj.insight
: "Phản hồi này cho thấy khách hàng có trải nghiệm " + sentimentText.toLowerCase() + " đối với sản phẩm hoặc dịch vụ.";

document.getElementById("insight").innerText =
insightText;

/* recommendation (nếu AI trả rỗng) */

let recommendText =
obj.recommendation && obj.recommendation.trim() !== ""
? obj.recommendation
: "Doanh nghiệp nên tiếp tục cải thiện chất lượng sản phẩm, tối ưu dịch vụ giao hàng và giữ mức giá hợp lý để nâng cao sự hài lòng của khách hàng.";

document.getElementById("recommendation").innerText =
recommendText;

/* dashboard */

updateStats(obj.sentiment);

}

function getStars(score){

let starScore = Math.round((score + 1) * 2) + 1;

return "⭐".repeat(starScore);

}

function setMeter(score){

let percent = (score+1)/2*100;

document.getElementById("meterBar").style.width =
percent+"%";

}

function highlightEmotion(text){

return text
.replace(/tốt|đẹp|hài lòng|tuyệt vời/gi,"<span style='color:#00ffae'>$&</span>")
.replace(/chậm|tệ|xấu|kém/gi,"<span style='color:#ff4d4d'>$&</span>");

}

function updateStats(sentiment){

stats[sentiment]++;

let total =
stats.positive +
stats.neutral +
stats.negative;

document.getElementById("positiveCount").innerText =
Math.round(stats.positive/total*100)+"%";

document.getElementById("neutralCount").innerText =
Math.round(stats.neutral/total*100)+"%";

document.getElementById("negativeCount").innerText =
Math.round(stats.negative/total*100)+"%";

}