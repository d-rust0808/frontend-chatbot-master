# API Documentation: Admin Users Balance & Top-up

## Tổng quan

Tài liệu này mô tả các API mới liên quan đến quản lý số dư (balance) và credit của users trong hệ thống admin.

**Version:** v1  
**Provider:** cdudu  
**Quyền truy cập:** Chỉ `sp-admin` (Super Admin)

---

## 1. GET /api/v1/admin/users

### Mô tả
API lấy danh sách users với thông tin số dư (balance) và credit. Đã được cập nhật để bao gồm thông tin balance và credit từ tenant đầu tiên của mỗi user.

### Endpoint
```
GET /api/v1/admin/users
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | string | No | "1" | Số trang |
| limit | string | No | "50" | Số lượng items mỗi trang (max: 100) |
| search | string | No | - | Tìm kiếm theo email hoặc name |

### Response

#### Success (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "cmk2lfvbd000213w29fyc7kg1",
      "email": "shop-b@shop-b.com",
      "name": "Chủ shop B",
      "createdAt": "2026-01-06T12:56:41.546Z",
      "updatedAt": "2026-01-06T12:56:41.546Z",
      "balance": 1000000,
      "credit": 5000,
      "_count": {
        "tenants": 1
      }
    },
    {
      "id": "cmk2l9psx0002ung35tgbq9br",
      "email": "shop-a@shop-a.com",
      "name": "Chủ Shop A",
      "createdAt": "2026-01-06T12:51:54.465Z",
      "updatedAt": "2026-01-06T12:51:54.465Z",
      "balance": 500000,
      "credit": 3000,
      "_count": {
        "tenants": 1
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data[].id` | string | User ID |
| `data[].email` | string | Email của user |
| `data[].name` | string | Tên user |
| `data[].createdAt` | string (ISO 8601) | Ngày tạo |
| `data[].updatedAt` | string (ISO 8601) | Ngày cập nhật |
| `data[].balance` | number | **MỚI** - Số dư VND (từ tenant đầu tiên) |
| `data[].credit` | number | **MỚI** - Số credit (từ tenant đầu tiên) |
| `data[]._count.tenants` | number | Số lượng tenants của user |
| `meta.page` | number | Trang hiện tại |
| `meta.limit` | number | Số items mỗi trang |
| `meta.total` | number | Tổng số users |
| `meta.totalPages` | number | Tổng số trang |

#### Error Responses

**401 Unauthorized**
```json
{
  "error": {
    "message": "Unauthorized",
    "statusCode": 401
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**403 Forbidden** (Không phải sp-admin)
```json
{
  "error": {
    "message": "Forbidden - Super admin access required",
    "statusCode": 403
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**500 Internal Server Error**
```json
{
  "error": {
    "message": "Internal server error",
    "statusCode": 500
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

### Lưu ý

1. **Balance và Credit:** Được lấy từ tenant đầu tiên của user. Nếu user có nhiều tenants, chỉ lấy từ tenant đầu tiên.
2. **User không có tenant:** Balance và credit sẽ là `0`.
3. **Lỗi khi lấy balance/credit:** Nếu có lỗi khi lấy balance/credit, giá trị sẽ là `0` và không throw error (để không ảnh hưởng đến việc lấy danh sách users).

### Example Usage

#### JavaScript/TypeScript
```typescript
async function getUsersWithBalance(page = 1, limit = 20, search?: string) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await fetch(`/api/v1/admin/users?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// Usage
const users = await getUsersWithBalance(1, 20);
console.log(users.data[0].balance); // 1000000
console.log(users.data[0].credit);  // 5000
```

#### cURL
```bash
curl -X GET "https://cchatbot.pro/api/v1/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 2. POST /api/v1/admin/users/:userId/top-up

### Mô tả
API cho phép sp-admin nạp tiền (VND) và/hoặc credit trực tiếp cho user. Số tiền sẽ được nạp vào tenant đầu tiên của user.

### Endpoint
```
POST /api/v1/admin/users/:userId/top-up
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Yes | ID của user cần nạp tiền |

### Request Body
```json
{
  "vndAmount": 1000000,
  "creditAmount": 5000,
  "reason": "Manual top-up by admin"
}
```

#### Request Body Schema

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `vndAmount` | number (integer, >= 0) | No | - | Số tiền VND cần nạp |
| `creditAmount` | number (integer, >= 0) | No | - | Số credit cần nạp |
| `reason` | string | No | "Manual top-up by admin" | Lý do nạp tiền (max: 500 chars) |

**Lưu ý:** Phải có ít nhất một trong hai: `vndAmount` hoặc `creditAmount`.

### Response

#### Success (200 OK)
```json
{
  "success": true,
  "message": "Balance topped up successfully",
  "data": {
    "userId": "cmk2lfvbd000213w29fyc7kg1",
    "tenantId": "tenant_123",
    "tenantName": "Shop B",
    "vndAmount": 1000000,
    "creditAmount": 5000,
    "newBalance": 2000000,
    "newCredit": 10000
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.userId` | string | ID của user được nạp tiền |
| `data.tenantId` | string | ID của tenant (tenant đầu tiên) |
| `data.tenantName` | string | Tên tenant |
| `data.vndAmount` | number | Số VND đã nạp |
| `data.creditAmount` | number | Số credit đã nạp |
| `data.newBalance` | number | Số dư VND mới sau khi nạp |
| `data.newCredit` | number | Số credit mới sau khi nạp |

#### Error Responses

**400 Bad Request** - Validation error
```json
{
  "error": {
    "message": "Validation error",
    "statusCode": 400,
    "details": [
      {
        "path": ["vndAmount"],
        "message": "Expected number, received string"
      }
    ]
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**400 Bad Request** - Không có amount nào
```json
{
  "error": {
    "message": "Must provide either vndAmount or creditAmount",
    "statusCode": 400
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**404 Not Found** - User không tồn tại
```json
{
  "error": {
    "message": "User not found",
    "statusCode": 404
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**400 Bad Request** - User không có tenant
```json
{
  "error": {
    "message": "User has no tenant. Cannot top-up balance.",
    "statusCode": 400
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**403 Forbidden** - Không phải sp-admin
```json
{
  "error": {
    "message": "Forbidden - Super admin access required",
    "statusCode": 403
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

**500 Internal Server Error**
```json
{
  "error": {
    "message": "Internal server error",
    "statusCode": 500
  },
  "api_version": "v1",
  "provider": "cdudu"
}
```

### Lưu ý

1. **Tenant đầu tiên:** Số tiền sẽ được nạp vào tenant đầu tiên của user.
2. **Auto-create wallet:** Nếu tenant chưa có wallet, hệ thống sẽ tự động tạo.
3. **Transaction logging:** Mọi giao dịch đều được ghi log với metadata (adminUserId, adminAction: true).
4. **Có thể nạp cả hai:** Có thể nạp cả VND và Credit trong một request.
5. **Validation:** 
   - `vndAmount` và `creditAmount` phải là số nguyên >= 0
   - Phải có ít nhất một trong hai
   - `reason` tối đa 500 ký tự

### Example Usage

#### JavaScript/TypeScript
```typescript
interface TopUpRequest {
  vndAmount?: number;
  creditAmount?: number;
  reason?: string;
}

async function topUpUserBalance(
  userId: string,
  request: TopUpRequest
) {
  const response = await fetch(`/api/v1/admin/users/${userId}/top-up`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vndAmount: request.vndAmount,
      creditAmount: request.creditAmount,
      reason: request.reason || 'Manual top-up by admin',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to top-up balance');
  }
  
  const data = await response.json();
  return data;
}

// Usage: Nạp cả VND và Credit
const result = await topUpUserBalance('cmk2lfvbd000213w29fyc7kg1', {
  vndAmount: 1000000,
  creditAmount: 5000,
  reason: 'Nạp tiền tháng 1/2026',
});

console.log(`New balance: ${result.data.newBalance} VND`);
console.log(`New credit: ${result.data.newCredit}`);

// Usage: Chỉ nạp VND
await topUpUserBalance('cmk2lfvbd000213w29fyc7kg1', {
  vndAmount: 500000,
});

// Usage: Chỉ nạp Credit
await topUpUserBalance('cmk2lfvbd000213w29fyc7kg1', {
  creditAmount: 10000,
});
```

#### React Component Example
```tsx
import React, { useState } from 'react';

interface TopUpFormProps {
  userId: string;
  onSuccess?: () => void;
}

const TopUpForm: React.FC<TopUpFormProps> = ({ userId, onSuccess }) => {
  const [vndAmount, setVndAmount] = useState<number>(0);
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (vndAmount === 0 && creditAmount === 0) {
      setError('Phải nhập ít nhất một loại tiền (VND hoặc Credit)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/top-up`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vndAmount: vndAmount || undefined,
          creditAmount: creditAmount || undefined,
          reason: reason || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to top-up');
      }

      const data = await response.json();
      alert(`Nạp tiền thành công!\nSố dư mới: ${data.data.newBalance.toLocaleString()} VND\nCredit mới: ${data.data.newCredit.toLocaleString()}`);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Số tiền VND:
          <input
            type="number"
            min="0"
            value={vndAmount}
            onChange={(e) => setVndAmount(Number(e.target.value))}
            placeholder="0"
          />
        </label>
      </div>
      
      <div>
        <label>
          Số Credit:
          <input
            type="number"
            min="0"
            value={creditAmount}
            onChange={(e) => setCreditAmount(Number(e.target.value))}
            placeholder="0"
          />
        </label>
      </div>
      
      <div>
        <label>
          Lý do (tùy chọn):
          <input
            type="text"
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Manual top-up by admin"
          />
        </label>
      </div>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Nạp tiền'}
      </button>
    </form>
  );
};

export default TopUpForm;
```

#### cURL
```bash
# Nạp cả VND và Credit
curl -X POST "https://cchatbot.pro/api/v1/admin/users/cmk2lfvbd000213w29fyc7kg1/top-up" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vndAmount": 1000000,
    "creditAmount": 5000,
    "reason": "Manual top-up by admin"
  }'

# Chỉ nạp VND
curl -X POST "https://cchatbot.pro/api/v1/admin/users/cmk2lfvbd000213w29fyc7kg1/top-up" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vndAmount": 500000
  }'

# Chỉ nạp Credit
curl -X POST "https://cchatbot.pro/api/v1/admin/users/cmk2lfvbd000213w29fyc7kg1/top-up" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "creditAmount": 10000
  }'
```

---

## 3. UI/UX Recommendations

### Danh sách Users

1. **Hiển thị Balance và Credit:**
   - Format số: `1,000,000 VND` và `5,000 Credits`
   - Màu sắc:
     - Balance = 0: Màu xám
     - Balance > 0: Màu xanh lá
     - Credit = 0: Màu xám
     - Credit > 0: Màu xanh dương

2. **Sorting:**
   - Cho phép sort theo balance hoặc credit (ascending/descending)

3. **Filtering:**
   - Filter users có balance = 0
   - Filter users có credit = 0
   - Filter users có balance/credit thấp

### Form Nạp Tiền

1. **Validation:**
   - Disable submit nếu cả hai field đều = 0
   - Hiển thị warning nếu user không có tenant
   - Format số với dấu phẩy (1,000,000)

2. **Confirmation:**
   - Hiển thị dialog xác nhận trước khi nạp
   - Show preview: "Bạn sẽ nạp 1,000,000 VND và 5,000 Credits cho user X"

3. **Success Feedback:**
   - Toast notification khi nạp thành công
   - Hiển thị số dư mới
   - Refresh danh sách users để cập nhật balance/credit

4. **Error Handling:**
   - Hiển thị error message rõ ràng
   - Retry button nếu lỗi network

---

## 4. Testing Checklist

### GET /api/v1/admin/users

- [ ] Lấy danh sách users thành công
- [ ] Balance và credit được hiển thị đúng
- [ ] User không có tenant → balance = 0, credit = 0
- [ ] Pagination hoạt động đúng
- [ ] Search hoạt động đúng
- [ ] Error handling (401, 403, 500)

### POST /api/v1/admin/users/:userId/top-up

- [ ] Nạp VND thành công
- [ ] Nạp Credit thành công
- [ ] Nạp cả VND và Credit thành công
- [ ] Validation: không có amount nào → error 400
- [ ] Validation: vndAmount < 0 → error 400
- [ ] Validation: creditAmount < 0 → error 400
- [ ] User không tồn tại → error 404
- [ ] User không có tenant → error 400
- [ ] Không phải sp-admin → error 403
- [ ] Response có đầy đủ thông tin (newBalance, newCredit)
- [ ] Transaction được ghi log đúng

---

## 5. Changelog

### Version 1.0.0 (2026-01-06)

**Added:**
- Thêm `balance` và `credit` vào response của GET /api/v1/admin/users
- API mới: POST /api/v1/admin/users/:userId/top-up để nạp tiền

**Changed:**
- GET /api/v1/admin/users response format (thêm balance, credit)

**Security:**
- Chỉ sp-admin mới có quyền sử dụng top-up API

---

## 6. Support & Contact

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ:
- Email: support@cdudu.com
- Documentation: https://docs.cdudu.com

