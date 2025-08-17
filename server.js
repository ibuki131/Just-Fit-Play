const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors()); // フロントエンドと通信可能にする

const DB_FILE = "applications.json";

// データを読み込む関数
const readData = () => {
    if (fs.existsSync(DB_FILE)) {
        return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
    return [];
};

// データを保存する関数
const saveData = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// 申し込みを受け付けるAPI
app.post("/apply", (req, res) => {
    const applications = readData();
    const newApplication = req.body;

    applications.push(newApplication);
    saveData(applications);

    res.json({ success: true, message: "申し込み完了！" });
});

// 申し込み一覧を取得するAPI（カレンダー表示用）
app.get("/applications", (req, res) => {
    const applications = readData();
    res.json(applications);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
