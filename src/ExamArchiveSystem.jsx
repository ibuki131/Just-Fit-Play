import React, { useState, useEffect } from 'react';
import { Upload, Home, FileText, Calendar, Download, Search, X, Filter, ChevronDown } from 'lucide-react';

const ExamArchiveSystem = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [exams, setExams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadInfo, setUploadInfo] = useState({
    title: '',
    classType: '',
    department: '',
    course: '',
    subject: '',
    isCommon: false,
    teacher: '',
    year: new Date().getFullYear(),
    description: ''
  });
  const [filters, setFilters] = useState({
    classType: '',
    department: '',
    course: '',
    subject: '',
    isCommon: null,
    teacher: ''
  });

  const classTypes = ['1類', '2類', '3類', '4類', '5類'];
  
  const departments = [
    '知能情報工学科',
    '情報・通信工学科',
    '知的システム工学科',
    '物理情報工学科',
    '生命化学情報工学科'
  ];

  const courses = [
    'データ科学コース',
    '人工知能コース',
    'メディア情報学コース',
    'ソフトウェアデザインコース',
    '情報通信ネットワークコース',
    'コンピュータ工学コース',
    'ロボティクスコース',
    'システム制御コース',
    '先進機械コース',
    '電子物理工学コース',
    '生物物理工学コース',
    '分子生命工学コース',
    '医用生命工学コース'
  ];



  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const result = await window.storage.list('exam:');
      if (result && result.keys) {
        const examData = await Promise.all(
          result.keys.map(async (key) => {
            try {
              const data = await window.storage.get(key);
              return data ? JSON.parse(data.value) : null;
            } catch {
              return null;
            }
          })
        );
        setExams(examData.filter(exam => exam !== null));
      }
    } catch (error) {
      console.log('過去問データの読み込み:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      if (!uploadInfo.title) {
        setUploadInfo(prev => ({ ...prev, title: file.name }));
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadInfo.title || !uploadInfo.subject) {
      alert('ファイル、タイトル、教科を入力してください');
      return;
    }

    if (!uploadInfo.isCommon && !uploadInfo.classType && !uploadInfo.department && !uploadInfo.course) {
      alert('共通科目でない場合は、類・学科・コースのいずれかを選択してください');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const examData = {
          id: `exam_${Date.now()}`,
          title: uploadInfo.title,
          classType: uploadInfo.classType,
          department: uploadInfo.department,
          course: uploadInfo.course,
          subject: uploadInfo.subject,
          isCommon: uploadInfo.isCommon,
          teacher: uploadInfo.teacher,
          year: uploadInfo.year,
          description: uploadInfo.description,
          fileName: uploadFile.name,
          fileType: uploadFile.type,
          fileData: e.target.result,
          uploadDate: new Date().toISOString()
        };

        try {
          await window.storage.set(`exam:${examData.id}`, JSON.stringify(examData), true);
          await loadExams();
          setUploadFile(null);
          setUploadInfo({
            title: '',
            classType: '',
            department: '',
            course: '',
            subject: '',
            isCommon: false,
            teacher: '',
            year: new Date().getFullYear(),
            description: ''
          });
          setCurrentPage('home');
          alert('過去問をアップロードしました！');
        } catch (error) {
          console.error('保存エラー:', error);
          alert('保存に失敗しました');
        }
      };
      reader.readAsDataURL(uploadFile);
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    }
  };

  const handleDownload = (exam) => {
    const link = document.createElement('a');
    link.href = exam.fileData;
    link.download = exam.fileName;
    link.click();
  };



  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.teacher && exam.teacher.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClassType = !filters.classType || exam.classType === filters.classType;
    const matchesDepartment = !filters.department || exam.department === filters.department;
    const matchesCourse = !filters.course || exam.course === filters.course;
    const matchesSubject = !filters.subject || exam.subject === filters.subject;
    const matchesCommon = filters.isCommon === null || exam.isCommon === filters.isCommon;
    const matchesTeacher = !filters.teacher || (exam.teacher && exam.teacher.toLowerCase().includes(filters.teacher.toLowerCase()));

    return matchesSearch && matchesClassType && matchesDepartment && matchesCourse && matchesSubject && matchesCommon && matchesTeacher;
  });

  const groupedExams = filteredExams.reduce((acc, exam) => {
    const key = exam.isCommon ? '共通科目' : (exam.course || exam.department || exam.classType || 'その他');
    if (!acc[key]) acc[key] = [];
    acc[key].push(exam);
    return acc;
  }, {});

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">過去問アーカイブ</h1>
            </div>
            <button
              onClick={() => setCurrentPage('upload')}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-md"
            >
              <Upload className="w-5 h-5" />
              <span>アップロード</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="タイトル、教科、先生で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-semibold text-gray-800">フィルター</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <select
                value={filters.classType}
                onChange={(e) => setFilters({...filters, classType: e.target.value})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="">類（全て）</option>
                {classTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>

              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="">学科（全て）</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>

              <select
                value={filters.course}
                onChange={(e) => setFilters({...filters, course: e.target.value})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="">コース（全て）</option>
                {courses.map(course => <option key={course} value={course}>{course}</option>)}
              </select>

              <select
                value={filters.isCommon === null ? '' : filters.isCommon.toString()}
                onChange={(e) => setFilters({...filters, isCommon: e.target.value === '' ? null : e.target.value === 'true'})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="">全て</option>
                <option value="true">共通科目</option>
                <option value="false">専門科目</option>
              </select>

              <input
                type="text"
                placeholder="先生名"
                value={filters.teacher}
                onChange={(e) => setFilters({...filters, teacher: e.target.value})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
              />

              <button
                onClick={() => setFilters({classType: '', department: '', course: '', subject: '', isCommon: null, teacher: ''})}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
              >
                クリア
              </button>
            </div>
          </div>
        </div>

        {Object.keys(groupedExams).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">条件に一致する過去問がありません</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedExams).map(([category, categoryExams]) => (
              <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-indigo-600 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">{category}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-lg transition cursor-pointer"
                        onClick={() => setSelectedExam(exam)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 flex-1">{exam.title}</h3>
                          <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-indigo-600 font-medium">{exam.subject}</p>
                          {exam.teacher && <p className="text-sm text-gray-600">先生: {exam.teacher}</p>}
                          <p className="text-sm text-gray-600">{exam.year}年度</p>
                          {exam.isCommon && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded">共通</span>}
                        </div>
                        {exam.description && (
                          <p className="text-sm text-gray-500 line-clamp-2">{exam.description}</p>
                        )}
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-400 truncate">{exam.fileName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(exam);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 ml-2"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{selectedExam.title}</h2>
              <button
                onClick={() => setSelectedExam(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-600"><span className="font-semibold">教科:</span> {selectedExam.subject}</p>
              {selectedExam.isCommon ? (
                <p className="text-gray-600"><span className="font-semibold">区分:</span> 共通科目</p>
              ) : (
                <>
                  {selectedExam.classType && <p className="text-gray-600"><span className="font-semibold">類:</span> {selectedExam.classType}</p>}
                  {selectedExam.department && <p className="text-gray-600"><span className="font-semibold">学科:</span> {selectedExam.department}</p>}
                  {selectedExam.course && <p className="text-gray-600"><span className="font-semibold">コース:</span> {selectedExam.course}</p>}
                </>
              )}
              {selectedExam.teacher && <p className="text-gray-600"><span className="font-semibold">先生:</span> {selectedExam.teacher}</p>}
              <p className="text-gray-600"><span className="font-semibold">年度:</span> {selectedExam.year}年度</p>
              <p className="text-gray-600"><span className="font-semibold">ファイル名:</span> {selectedExam.fileName}</p>
              {selectedExam.description && (
                <p className="text-gray-600"><span className="font-semibold">説明:</span> {selectedExam.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDownload(selectedExam)}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              <Download className="w-5 h-5" />
              <span>ダウンロード</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const UploadPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
        <header className="bg-white shadow-md">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-800">過去問アップロード</h1>
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center space-x-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition shadow-md"
              >
                <Home className="w-5 h-5" />
                <span>ホームに戻る</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ファイルを選択 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      {uploadFile ? uploadFile.name : 'クリックしてファイルを選択'}
                    </p>
                    <p className="text-sm text-gray-400">PDF, Word, 画像ファイル対応</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadInfo.title}
                  onChange={(e) => setUploadInfo({...uploadInfo, title: e.target.value})}
                  placeholder="例: 2024年度 第1回定期テスト"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCommon"
                  checked={uploadInfo.isCommon}
                  onChange={(e) => setUploadInfo({
                    ...uploadInfo, 
                    isCommon: e.target.checked,
                    classType: e.target.checked ? '' : uploadInfo.classType,
                    department: e.target.checked ? '' : uploadInfo.department,
                    course: e.target.checked ? '' : uploadInfo.course,
                    subject: ''
                  })}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isCommon" className="text-sm font-semibold text-gray-700">
                  共通科目
                </label>
              </div>

              {!uploadInfo.isCommon && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      類
                    </label>
                    <select
                      value={uploadInfo.classType}
                      onChange={(e) => setUploadInfo({...uploadInfo, classType: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      {classTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      学科
                    </label>
                    <select
                      value={uploadInfo.department}
                      onChange={(e) => setUploadInfo({...uploadInfo, department: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      コース
                    </label>
                    <select
                      value={uploadInfo.course}
                      onChange={(e) => setUploadInfo({...uploadInfo, course: e.target.value, subject: ''})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">選択してください</option>
                      {courses.map(course => <option key={course} value={course}>{course}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  教科名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadInfo.subject}
                  onChange={(e) => setUploadInfo({...uploadInfo, subject: e.target.value})}
                  placeholder="例: データ構造とアルゴリズム"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
                <p className="mt-2 text-sm text-red-600 font-medium">
                  ⚠️ 注意: 教科名は正式名称で入力してください。略称や省略形では受け付けません。
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  例: 「データアルゴ」❌ → 「データ構造とアルゴリズム」✅
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  先生
                </label>
                <input
                  type="text"
                  value={uploadInfo.teacher}
                  onChange={(e) => setUploadInfo({...uploadInfo, teacher: e.target.value})}
                  placeholder="例: 田中太郎"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  年度
                </label>
                <input
                  type="number"
                  value={uploadInfo.year}
                  onChange={(e) => setUploadInfo({...uploadInfo, year: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={uploadInfo.description}
                  onChange={(e) => setUploadInfo({...uploadInfo, description: e.target.value})}
                  placeholder="この過去問についての補足情報があれば記入してください"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleUploadSubmit}
                disabled={!uploadFile || !uploadInfo.title || !uploadInfo.subject}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md text-lg font-semibold"
              >
                <Upload className="w-6 h-6" />
                <span>アップロード</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return currentPage === 'home' ? <HomePage /> : <UploadPage />;
};

export default ExamArchiveSystem;