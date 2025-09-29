# aiten-agent

Agent Node.js (TypeScript) subscribe từ local MQTT broker và đẩy dữ liệu lên AWS Lambda `aiten-robot-status` bằng AWS SDK v3.

## Tính năng
- Subscribe từ MQTT topic cấu hình (VD: `robot/status/#`).
- Mỗi message sẽ được invoke tới Lambda `aiten-robot-status` (hoặc tên hàm khác qua env).
- Dùng AWS SDK v3 (`@aws-sdk/client-lambda`).

## Cấu hình môi trường
Tạo file `.env` trong thư mục `aiten-agent` (hoặc export env tương đương):

```
MQTT_URL=mqtt://localhost:1883
MQTT_TOPIC=robot/status/#
# nếu broker cần auth
# MQTT_USERNAME=...
# MQTT_PASSWORD=...

# AWS config
AWS_REGION=ap-southeast-1
LAMBDA_FUNCTION_NAME=aiten-robot-status
```

AWS credentials lấy theo Default Provider Chain (ENV, shared config, IAM role, v.v.).

## Cài đặt & chạy
Do môi trường hiện tại bị giới hạn mạng, vui lòng chạy các lệnh này ở máy bạn khi có kết nối:

```
cd aiten-agent
npm install
npm run build
npm start
```

Trong quá trình phát triển:

```
npm run dev
```

## Ghi chú triển khai
- Payload gửi lên Lambda có dạng:

```json
{
  "topic": "<mqtt-topic>",
  "message": {},
  "receivedAt": "2025-01-01T00:00:00.000Z",
  "qos": 0,
  "retain": false
}
```

- `message` sẽ tự parse JSON nếu có, nếu không sẽ là string raw.
- Xử lý retry/backoff có thể bổ sung nếu cần throughput cao hoặc chống lỗi tạm thời của Lambda.
- Với lượng message lớn, cân nhắc batching hoặc SQS/SNS làm đệm.

## Scripts
- `npm run build`: build TypeScript sang `dist/`.
- `npm start`: chạy runtime từ `dist/` (kèm `dotenv/config`).
- `npm run dev`: chạy development (reload) với `ts-node-dev`.
- `npm run typecheck`: chỉ kiểm tra type, không build.
# aiten-agent
