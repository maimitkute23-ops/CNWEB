const button = document.getElementById("sendBtn");

// Gắn sự kiện click cho nút Send
button.addEventListener("click", analyzeText);

// Hỗ trợ nhấn Enter trong ô input để gửi
document.getElementById("commentInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        analyzeText();
    }
});

async function analyzeText() {
    const textInput = document.getElementById("commentInput");
    const text = textInput.value.trim();

    if (text === "") {
        alert("Vui lòng nhập phản hồi của khách hàng!");
        return;
    }

    // Hiệu ứng UX: Đổi trạng thái nút khi đang call API
    const originalBtnHTML = button.innerHTML;
    button.innerHTML = "Analyzing...";
    button.disabled = true;

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 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"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "user",
                            content: `
Analyze this customer feedback carefully:
"${text}"

Return ONLY valid JSON format.
Do not explain anything.

{
  "sentiment": "positive/neutral/negative",
  "satisfaction_score": 0,
  "loyalty_score": 0,
  "aspect": {
    "quality": "",
    "price": "",
    "service": "",
    "delivery": ""
  },
  "customer_portrait": "",
  "improvement_proposal": ""
}

Strict Guidelines for AI:
1. satisfaction_score (0-100): ĐÂY LÀ ĐIỂM HÀI LÒNG. Nếu khách chê bai/tức giận -> BẮT BUỘC điểm phải DƯỚI 30. Nếu khen ngợi -> điểm TRÊN 70. 
2. loyalty_score (0-100): Ước tính tỷ lệ quay lại. Nếu chê chất lượng, điểm dưới 30. Nếu khen, điểm trên 70.
3. customer_portrait: Trả lời bằng tiếng Việt (2-3 câu). Suy luận về: tính cách (khó tính/dễ tính), thói quen, mức độ sẵn sàng chi trả, điều họ quan tâm (giá hay chất lượng).
4. improvement_proposal: Trả lời bằng tiếng Việt. BẮT BUỘC LUÔN CÓ. Nếu tiêu cực: cách đền bù/xin lỗi. Nếu tích cực: cách up-sell hoặc duy trì.
5. aspect: Trích xuất ngắn gọn bằng tiếng Việt. Nếu không nhắc đến, ghi "Không đề cập".
`
                        }
                    ],
                    temperature: 0.1 // Hạ thấp temperature tối đa để AI tuân thủ luật chấm điểm khắt khe hơn
                })
            }
        );

        const data = await response.json();
        console.log("API RESPONSE:", data);

        if (!data.choices) {
            console.error(data);
            alert("API returned error");
            return;
        }

        let result = data.choices[0].message.content.trim();

        // FIX: Groq đôi khi trả text + json, dùng Regex để bóc tách JSON
        const match = result.match(/\{[\s\S]*\}/);
        if (match) {
            result = match[0];
        }

        displayResult(result);

    } catch (error) {
        console.error("API ERROR:", error);
        alert("Lỗi kết nối đến AI API");
    } finally {
        // Khôi phục nút bấm sau khi xong
        button.innerHTML = originalBtnHTML;
        button.disabled = false;
    }
}

function displayResult(result) {
    let obj;
    try {
        obj = JSON.parse(result);
        console.log("PARSED OBJECT:", obj); 
    } catch (e) {
        console.log("RAW RESULT:", result);
        alert("AI trả dữ liệu không đúng chuẩn JSON. Vui lòng thử lại.");
        return;
    }

    // --- 1. XỬ LÝ HIỆU ỨNG NHÁY MÀN HÌNH ---
    const flashOverlay = document.getElementById("flash-overlay");
    if (flashOverlay) {
        // Xóa các class cũ (nếu có)
        flashOverlay.classList.remove("flash-positive", "flash-neutral", "flash-negative");
        
        // Thêm class nháy tương ứng với cảm xúc
        if (obj.sentiment === "positive") {
            flashOverlay.classList.add("flash-positive");
        } else if (obj.sentiment === "negative") {
            flashOverlay.classList.add("flash-negative");
        } else {
            flashOverlay.classList.add("flash-neutral");
        }
        
        // Tự động xóa class sau 1 giây để trả lại màn hình bình thường
        setTimeout(() => {
            flashOverlay.classList.remove("flash-positive", "flash-neutral", "flash-negative");
        }, 1000); 
    } else {
        console.warn("Chưa thêm thẻ <div id='flash-overlay'></div> vào file HTML.");
    }

    // --- 2. CẬP NHẬT EMOTION BADGES ---
    document.getElementById("emoPositive").classList.remove("active");
    document.getElementById("emoNeutral").classList.remove("active");
    document.getElementById("emoNegative").classList.remove("active");

    if (obj.sentiment === "positive") {
        document.getElementById("emoPositive").classList.add("active");
    } else if (obj.sentiment === "negative") {
        document.getElementById("emoNegative").classList.add("active");
    } else {
        document.getElementById("emoNeutral").classList.add("active");
    }

    // --- 3. CẬP NHẬT PROGRESS BARS ---
    const satisfactionScore = Math.max(0, Math.min(100, obj.satisfaction_score || 0));
    const loyaltyScore = Math.max(0, Math.min(100, obj.loyalty_score || 0));

    document.getElementById("sentimentBar").style.width = satisfactionScore + "%";
    document.getElementById("loyaltyBar").style.width = loyaltyScore + "%";

    // --- 4. CẬP NHẬT DETAILED ANALYSIS ---
    document.getElementById("resQuality").innerText = obj.aspect?.quality || "Không đề cập";
    document.getElementById("resPrice").innerText = obj.aspect?.price || "Không đề cập";
    document.getElementById("resService").innerText = obj.aspect?.service || "Không đề cập";
    document.getElementById("resDelivery").innerText = obj.aspect?.delivery || "Không đề cập";

    // --- 5. CẬP NHẬT CUSTOMER PORTRAIT & IMPROVEMENT PROPOSAL ---
    document.getElementById("resPortrait").innerText = 
        (obj.customer_portrait && obj.customer_portrait.trim() !== "") 
        ? obj.customer_portrait 
        : "Không có đủ thông tin để phác họa chân dung.";
        
    document.getElementById("resProposal").innerText = 
        (obj.improvement_proposal && obj.improvement_proposal.trim() !== "") 
        ? obj.improvement_proposal 
        : "Cần theo dõi thêm.";
}