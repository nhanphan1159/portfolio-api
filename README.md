# Portfolio API

API backend cho portfolio website với Hono + Prisma + Cloudinary

## 🚀 Setup

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Cấu hình môi trường

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

### 3. Cấu hình Cloudinary

1. Đăng ký tài khoản miễn phí tại: https://cloudinary.com
2. Vào Dashboard: https://cloudinary.com/console
3. Copy các thông tin sau vào file `.env`:
   - Cloud Name
   - API Key
   - API Secret

### 4. Chạy development server

```bash
pnpm dev
```

### 5. Deploy lên Cloudflare Workers

```bash
pnpm deploy
```

## 📸 Upload Hình Ảnh & Quản Lý Projects

### Project APIs (với upload ảnh)

#### 1. Tạo project mới với upload ảnh

```http
POST /api/projects
Content-Type: multipart/form-data

Body:
- title: (string, required) - Tên project
- task: (string, required) - Mô tả công việc
- imgMain: (file, required) - Ảnh chính của project
- img: (file[], optional) - Mảng ảnh bổ sung
- url: (string, optional) - URL demo/github
```

**Response:**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "title": "E-commerce Website",
    "task": "Full-stack development",
    "imgMain": "https://res.cloudinary.com/xxx/portfolio/projects/main.jpg",
    "img": "[\"https://res.cloudinary.com/xxx/portfolio/projects/img1.jpg\", \"https://res.cloudinary.com/xxx/portfolio/projects/img2.jpg\"]",
    "url": "https://github.com/...",
    "createdAt": "2025-11-27T...",
    "updatedAt": "2025-11-27T..."
  }
}
```

#### 2. Update project với upload ảnh

```http
PUT /api/projects/:id
Content-Type: multipart/form-data

Body:
- title: (string, optional)
- task: (string, optional)
- imgMain: (file, optional) - Upload ảnh chính mới
- img: (file[], optional) - Upload mảng ảnh mới
- url: (string, optional)
```

#### 3. Tạo/Update project với URL (không upload file)

```http
POST /api/projects/url
PUT /api/projects/:id/url
Content-Type: application/json

Body:
{
  "title": "Project name",
  "task": "Description",
  "imgMain": "https://example.com/image.jpg",
  "img": ["url1", "url2"],
  "url": "https://demo.com"
}
```

### Upload APIs (riêng biệt)

#### 1. Upload một ảnh

```http
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: (binary file)
- folder: (optional, default: "portfolio")
```

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "portfolio/abc123"
  }
}
```

#### 2. Upload nhiều ảnh

```http
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- files: (multiple binary files)
- folder: (optional, default: "portfolio")
```

**Response:**

```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": [
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "portfolio/abc123"
    },
    {
      "url": "https://res.cloudinary.com/...",
      "publicId": "portfolio/def456"
    }
  ]
}
```

### Giới hạn:

- Loại file: JPEG, PNG, GIF, WebP
- Kích thước tối đa: 5MB/file
- Tự động optimize và convert sang định dạng tốt nhất

### Ví dụ sử dụng:

#### JavaScript/TypeScript (Frontend)

```typescript
// ===== TẠO PROJECT VỚI UPLOAD ẢNH =====
const createProjectWithImages = async (
  title: string,
  task: string,
  imgMainFile: File,
  imgFiles: File[],
  url?: string
) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("task", task);
  formData.append("imgMain", imgMainFile); // File ảnh chính

  // Thêm nhiều ảnh phụ
  imgFiles.forEach((file) => {
    formData.append("img", file);
  });

  if (url) formData.append("url", url);

  const response = await fetch("http://localhost:3000/api/projects", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result.data;
};

// Ví dụ sử dụng trong React form
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  const imgMainFile =
    document.querySelector<HTMLInputElement>("#imgMain")?.files?.[0];
  const imgFilesInput = document.querySelector<HTMLInputElement>("#img")?.files;
  const imgFiles = imgFilesInput ? Array.from(imgFilesInput) : [];

  if (!imgMainFile) {
    alert("Vui lòng chọn ảnh chính");
    return;
  }

  const project = await createProjectWithImages(
    "My Portfolio",
    "Full-stack development with React & Node.js",
    imgMainFile,
    imgFiles,
    "https://github.com/myrepo"
  );

  console.log("Created project:", project);
};

// ===== UPDATE PROJECT VỚI UPLOAD ẢNH MỚI =====
const updateProjectWithImages = async (
  id: number,
  updates: {
    title?: string;
    task?: string;
    imgMainFile?: File;
    imgFiles?: File[];
    url?: string;
  }
) => {
  const formData = new FormData();

  if (updates.title) formData.append("title", updates.title);
  if (updates.task) formData.append("task", updates.task);
  if (updates.imgMainFile) formData.append("imgMain", updates.imgMainFile);
  if (updates.imgFiles) {
    updates.imgFiles.forEach((file) => {
      formData.append("img", file);
    });
  }
  if (updates.url !== undefined) formData.append("url", updates.url);

  const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
    method: "PUT",
    body: formData,
  });

  const result = await response.json();
  return result.data;
};

// ===== UPLOAD ẢNH RIÊNG BIỆT (không qua project) =====
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result.data.url; // URL của ảnh
};

// Upload nhiều ảnh
const uploadMultipleImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("http://localhost:3000/api/upload/multiple", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  return result.data.map((item) => item.url); // Array URLs
};
```

#### HTML Form Example

```html
<!-- Form tạo project với upload ảnh -->
<form id="projectForm" enctype="multipart/form-data">
  <input type="text" name="title" placeholder="Project Title" required />
  <input type="text" name="task" placeholder="Task Description" required />

  <!-- Ảnh chính (bắt buộc) -->
  <label>Main Image:</label>
  <input type="file" id="imgMain" name="imgMain" accept="image/*" required />

  <!-- Ảnh phụ (tùy chọn, có thể chọn nhiều) -->
  <label>Additional Images:</label>
  <input type="file" id="img" name="img" accept="image/*" multiple />

  <input type="text" name="url" placeholder="Demo URL (optional)" />

  <button type="submit">Create Project</button>
</form>

<script>
  document
    .getElementById("projectForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      const response = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);
    });
</script>
```

#### cURL Examples

```bash
# Tạo project với upload ảnh
curl -X POST http://localhost:3000/api/projects \
  -F "title=E-commerce Website" \
  -F "task=Full-stack development with React & Node.js" \
  -F "imgMain=@/path/to/main-image.jpg" \
  -F "img=@/path/to/screenshot1.jpg" \
  -F "img=@/path/to/screenshot2.jpg" \
  -F "url=https://github.com/myproject"

# Update project với ảnh mới
curl -X PUT http://localhost:3000/api/projects/1 \
  -F "title=Updated Title" \
  -F "imgMain=@/path/to/new-main-image.jpg"

# Tạo project với URL (không upload file)
curl -X POST http://localhost:3000/api/projects/url \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "task": "Description",
    "imgMain": "https://example.com/image.jpg",
    "img": ["https://example.com/img1.jpg"],
    "url": "https://demo.com"
  }'

# Upload một ảnh riêng
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/image.jpg" \
  -F "folder=portfolio"

# Upload nhiều ảnh
curl -X POST http://localhost:3000/api/upload/multiple \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg"
```

## 📝 Cloudflare Workers Configuration

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
pnpm cf-typegen
```

**Lưu ý:** Để deploy lên Cloudflare Workers, cần thêm Cloudinary credentials vào Wrangler secrets:

```bash
wrangler secret put CLOUDINARY_CLOUD_NAME
wrangler secret put CLOUDINARY_API_KEY
wrangler secret put CLOUDINARY_API_SECRET
```
