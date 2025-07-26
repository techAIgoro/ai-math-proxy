// api/proxy.js

// Thay thế bằng URL Web App của Google Apps Script của bạn (kết thúc bằng /exec)
// Ví dụ: https://script.google.com/macros/s/AKfycbwJ3jvXr4pEVsBa0CgXaDxoVtj13ndJh27IZJQl1QtvLHgcaUoUB5tklX4KsEndsduo/exec
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxkAVwq77__h_RzjH6ir_ssCyl29zXJD89aK60d-uqpVwu-qt9G-v2tX4wVUX8MeyLB/exec";

export default async function handler(request) {
  // Xử lý preflight OPTIONS request cho CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No Content
      headers: {
        'Access-Control-Allow-Origin': '*', // Cho phép mọi nguồn gốc
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Cho phép các phương thức
        'Access-Control-Allow-Headers': 'Content-Type', // Cho phép header Content-Type
        'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
      },
    });
  }

  // Xử lý POST request
  if (request.method === 'POST') {
    try {
      // Lấy dữ liệu từ body của request đến proxy
      const requestBody = await request.json();

      // Gửi dữ liệu này đến Apps Script Backend
      const backendResponse = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Lấy phản hồi từ Apps Script Backend
      const responseData = await backendResponse.json();

      // Trả về phản hồi cho frontend, với header CORS
      return new Response(JSON.stringify(responseData), {
        status: backendResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Rất quan trọng: cho phép frontend truy cập
        },
      });
    } catch (error) {
      console.error("Lỗi khi xử lý proxy request:", error);
      return new Response(JSON.stringify({ success: false, error: "Lỗi proxy: " + error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }

  // Xử lý các phương thức khác (nếu có yêu cầu từ frontend, bạn có thể thêm logic cho GET)
  return new Response(JSON.stringify({ success: false, error: "Phương thức không được hỗ trợ." }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
