import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Check, Mail } from 'lucide-react';
import KoreanScheduleUI from './KoreanScheduleUI';
import EmailModal from './EmailModal';
import ProjectModal from './ProjectModal';

type ServiceType = 'OEM' | 'ODM' | 'OBM' | 'Private Label' | 'White Label' | '기타';
type ProjectStatus = '시작전' | '진행중' | '완료' | '중단';

interface Project {
  id: string;
  client: string;
  manager: string;
  productType: string;
  serviceType: ServiceType;
  currentStage: string[]; // 오늘 날짜에 걸쳐있는 task들
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  manufacturer: string;
  container: string;
  packaging: string;
  sales: string;
  purchase: string;
  priority: '높음' | '보통' | '낮음';
}

const ProjectList: React.FC = () => {
  const [statusFilters, setStatusFilters] = useState<ProjectStatus[]>(['시작전', '진행중', '완료']);
  const [sortField, setSortField] = useState<keyof Project | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedPriority, setSelectedPriority] = useState<'높음' | '보통' | '낮음' | 'all'>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | 'all'>('all');
  const [editingCell, setEditingCell] = useState<{projectId: string, field: string} | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptionsMenu(null);
    };
    
    if (showOptionsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOptionsMenu]);
  
  // Mock data for search - in real app, this would come from API
  const allClients = [
    '(주)뷰티코리아', '글로벌코스메틱', '네이처바이오', '프리미엄뷰티', '클린뷰티랩',
    '(주)아모레퍼시픽', 'LG생활건강', '코스맥스', '한국콜마', '코스온',
    '이니스프리', '미샤', '더페이스샵', '스킨푸드', '에뛰드하우스'
  ];
  
  const allFactories = [
    '큐셀시스템', '(주)연우', '(주)네트모베이지', '주식회사 코스모로스',
    '코스맥스', '한국콜마', '코스온', '대한화장품', '씨앤씨인터내셔널',
    '코스메카코리아', '코스비전', '화성코스메틱', '네오팜', '코스팩'
  ];
  
  // Helper function to get date relative to today
  const getRelativeDate = (daysFromToday: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().split('T')[0];
  };
  
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      client: '(주)뷰티코리아',
      manager: '김철수',
      productType: '스킨케어',
      serviceType: 'OEM',
      currentStage: ['샘플 제작', '품질 검사'],
      status: '진행중',
      progress: 65,
      startDate: getRelativeDate(7),  // 7 days from today
      endDate: getRelativeDate(45),   // 45 days from today,
      manufacturer: '큐셀시스템',
      container: '(주)연우',
      packaging: '(주)네트모베이지',
      sales: '1200000000',
      purchase: '800000000',
      priority: '보통'
    },
    {
      id: '2',
      client: '글로벌코스메틱',
      manager: '이영희',
      productType: '메이크업',
      serviceType: 'ODM',
      currentStage: ['디자인 검토'],
      status: '진행중',
      progress: 30,
      startDate: getRelativeDate(15),  // 15 days from today
      endDate: getRelativeDate(60),    // 60 days from today,
      manufacturer: '(주)연우',
      container: '큐셀시스템',
      packaging: '주식회사 코스모로스',
      sales: '500000000',
      purchase: '300000000',
      priority: '낮음'
    },
    {
      id: '3',
      client: '네이처바이오',
      manager: '박민수',
      productType: '헤어케어',
      serviceType: 'OBM',
      currentStage: ['최종 승인 대기'],
      status: '진행중',
      progress: 90,
      startDate: getRelativeDate(3),   // 3 days from today
      endDate: getRelativeDate(25),   // 25 days from today,
      manufacturer: '주식회사 코스모로스',
      container: '(주)네트모베이지',
      packaging: '(주)연우',
      sales: '800000000',
      purchase: '500000000',
      priority: '높음'
    },
    {
      id: '4',
      client: '프리미엄뷰티',
      manager: '정수진',
      productType: '바디케어',
      serviceType: 'Private Label',
      currentStage: [],
      status: '시작전',
      progress: 0,
      startDate: getRelativeDate(30),  // 30 days from today
      endDate: getRelativeDate(90),    // 90 days from today,
      manufacturer: '(주)네트모베이지',
      container: '주식회사 코스모로스',
      packaging: '큐셀시스템',
      sales: '300000000',
      purchase: '200000000',
      priority: '낮음'
    },
    {
      id: '5',
      client: '클린뷰티랩',
      manager: '최지훈',
      productType: '선케어',
      serviceType: 'White Label',
      currentStage: [],
      status: '완료',
      progress: 100,
      startDate: getRelativeDate(2),   // 2 days from today
      endDate: getRelativeDate(15),   // 15 days from today,
      manufacturer: '큐셀시스템',
      container: '(주)연우',
      packaging: '주식회사 코스모로스',
      sales: '1500000000',
      purchase: '1000000000',
      priority: '높음'
    }
  ]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // 프로젝트별 참여 공장 정보 (실제로는 백엔드에서 가져와야 함)
  const projectFactories: { [key: string]: Array<{ name: string; color: string }> } = {
    '1': [
      { name: '큐셀시스템', color: 'bg-blue-500' },
      { name: '(주)연우', color: 'bg-red-500' },
      { name: '(주)네트모베이지', color: 'bg-yellow-500' }
    ],
    '2': [
      { name: '(주)연우', color: 'bg-red-500' },
      { name: '큐셀시스템', color: 'bg-blue-500' },
      { name: '주식회사 코스모로스', color: 'bg-cyan-500' }
    ],
    '3': [
      { name: '주식회사 코스모로스', color: 'bg-cyan-500' },
      { name: '(주)네트모베이지', color: 'bg-yellow-500' },
      { name: '(주)연우', color: 'bg-red-500' }
    ],
    '4': [
      { name: '(주)네트모베이지', color: 'bg-yellow-500' },
      { name: '주식회사 코스모로스', color: 'bg-cyan-500' },
      { name: '큐셀시스템', color: 'bg-blue-500' }
    ],
    '5': [
      { name: '큐셀시스템', color: 'bg-blue-500' },
      { name: '(주)연우', color: 'bg-red-500' },
      { name: '주식회사 코스모로스', color: 'bg-cyan-500' }
    ]
  };

  if (selectedProject) {
    // Create participants array from project data
    const participants = [
      {
        id: selectedProject.id,
        name: selectedProject.client,
        period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`,
        color: "bg-blue-500"
      }
    ];
    
    // Add factories as participants if they exist
    if (selectedProject.manufacturer) {
      participants.push({
        id: `${selectedProject.id}-manufacturer`,
        name: selectedProject.manufacturer,
        period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`,
        color: "bg-green-500"
      });
    }
    
    if (selectedProject.container) {
      participants.push({
        id: `${selectedProject.id}-container`,
        name: selectedProject.container,
        period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`,
        color: "bg-purple-500"
      });
    }
    
    if (selectedProject.packaging) {
      participants.push({
        id: `${selectedProject.id}-packaging`,
        name: selectedProject.packaging,
        period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`,
        color: "bg-orange-500"
      });
    }
    
    return <KoreanScheduleUI 
      participants={participants}
      startDate={selectedProject.startDate}
      endDate={selectedProject.endDate}
    />;
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(sortedAndFilteredProjects.map(p => p.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (projectId: string) => {
    if (selectedRows.includes(projectId)) {
      setSelectedRows(selectedRows.filter(id => id !== projectId));
    } else {
      setSelectedRows([...selectedRows, projectId]);
    }
  };

  const SortableHeader: React.FC<{ field: keyof Project; children: React.ReactNode; className?: string }> = ({ field, children, className = '' }) => (
    <th 
      className={`text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 whitespace-nowrap transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  );

  // 선택된 프로젝트들의 모든 공장 정보 수집
  const getSelectedFactories = () => {
    const allFactories = new Map<string, { name: string; color: string }>();
    
    selectedRows.forEach(projectId => {
      const factories = projectFactories[projectId] || [];
      factories.forEach(factory => {
        allFactories.set(factory.name, factory);
      });
    });
    
    return Array.from(allFactories.values());
  };

  const formatDate = (dateStr: string) => {
    // Convert YYYY-MM-DD to YY-MM-DD
    return dateStr.slice(2);
  };

  const formatCurrency = (value: number) => {
    // Convert number to Korean currency format
    if (value === 0) return '0원';
    
    const eok = Math.floor(value / 100000000);
    const man = Math.floor((value % 100000000) / 10000);
    const remainder = value % 10000;
    
    let result = '';
    
    // 억 단위
    if (eok > 0) {
      result += `${eok}억`;
    }
    
    // 만 단위 (천만, 백만 포함)
    if (man > 0) {
      if (result) result += ' ';
      
      if (man >= 1000) {
        // 천만 단위
        const cheonman = Math.floor(man / 1000);
        const baekman = Math.floor((man % 1000) / 100);
        const restMan = man % 100;
        
        result += `${cheonman}천`;
        if (baekman > 0) result += `${baekman}백`;
        if (restMan > 0) result += `${restMan}`;
        result += '만';
      } else if (man >= 100) {
        // 백만 단위
        const baekman = Math.floor(man / 100);
        const restMan = man % 100;
        
        result += `${baekman}백`;
        if (restMan > 0) result += `${restMan}`;
        result += '만';
      } else {
        // 만 단위만
        result += `${man}만`;
      }
    }
    
    // 만 이하 단위는 일반적으로 생략
    if (remainder > 0 && eok === 0 && man === 0) {
      result += `${remainder}`;
    }
    
    return result + '원';
  };

  const parseCurrency = (str: string) => {
    // Parse Korean currency format to number
    let total = 0;
    
    // 억 단위 처리
    const eokMatch = str.match(/(\d+)억/);
    if (eokMatch) {
      total += parseInt(eokMatch[1]) * 100000000;
    }
    
    // 천만 단위 처리
    const cheonmanMatch = str.match(/(\d+)천(\d*)만/);
    if (cheonmanMatch) {
      const cheon = parseInt(cheonmanMatch[1]) * 10000000;
      const man = cheonmanMatch[2] ? parseInt(cheonmanMatch[2]) * 10000 : 0;
      total += cheon + man;
    } else {
      // 백만 단위 처리
      const baekmanMatch = str.match(/(\d+)백(\d*)만/);
      if (baekmanMatch) {
        const baek = parseInt(baekmanMatch[1]) * 1000000;
        const man = baekmanMatch[2] ? parseInt(baekmanMatch[2]) * 10000 : 0;
        total += baek + man;
      } else {
        // 만 단위만 처리
        const manMatch = str.match(/(\d+)만/);
        if (manMatch && !str.includes('천만') && !str.includes('백만')) {
          total += parseInt(manMatch[1]) * 10000;
        }
      }
    }
    
    // 원 단위 처리 (억, 만이 없을 때만)
    if (!str.includes('억') && !str.includes('만')) {
      const wonMatch = str.match(/(\d+)원/);
      if (wonMatch) {
        total += parseInt(wonMatch[1]);
      }
    }
    
    return total;
  };

  const handleSearch = (value: string, type: 'client' | 'factory') => {
    setSearchValue(value);
    if (value.trim()) {
      const dataSource = type === 'client' ? allClients : allFactories;
      const filtered = dataSource.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (value: string, projectId: string, field: string) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? {...p, [field]: value} : p
    );
    setProjects(updatedProjects);
    setEditingCell(null);
    setSearchValue('');
    setShowSuggestions(false);
  };

  const handleSendEmail = () => {
    // 프로젝트 선택 없이도 메일 보내기 가능 - 메일 모달에서 공장 검색
    setShowEmailModal(true);
  };

  const handleCreateProject = () => {
    setModalMode('create');
    setEditingProject(null);
    setShowProjectModal(true);
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(null);
        setDropdownPosition(null);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  const handleEditProject = (project: Project) => {
    setModalMode('edit');
    setEditingProject(project);
    setShowProjectModal(true);
    setShowOptionsMenu(null);
  };

  const handleSaveProject = (data: any) => {
    if (modalMode === 'create') {
      // Create new project
      const newProject: Project = {
        id: Date.now().toString(),
        ...data,
        currentStage: [],
        progress: 0
      };
      setProjects([...projects, newProject]);
    } else {
      // Update existing project
      setProjects(projects.map(p => 
        p.id === editingProject?.id ? { ...p, ...data } : p
      ));
    }
    setShowProjectModal(false);
  };

  const handleStatusFilterChange = (status: ProjectStatus) => {
    if (statusFilters.includes(status)) {
      setStatusFilters(statusFilters.filter(s => s !== status));
    } else {
      setStatusFilters([...statusFilters, status]);
    }
  };

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredProjects = projects
    .filter(p => {
      const statusMatch = statusFilters.includes(p.status);
      const priorityMatch = selectedPriority === 'all' || p.priority === selectedPriority;
      const serviceTypeMatch = selectedServiceType === 'all' || p.serviceType === selectedServiceType;
      return statusMatch && priorityMatch && serviceTypeMatch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">프로젝트 관리</h1>
              <p className="text-sm text-gray-500 mt-1">전체 프로젝트 현황을 한눈에 확인하세요</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="프로젝트명, 고객명, 공장명으로 검색..."
                  className="w-[500px] pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all hover:bg-white"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as '높음' | '보통' | '낮음' | 'all')}
                className="text-sm font-medium text-gray-700 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              >
                <option value="all">모든 우선순위</option>
                <option value="높음">높음</option>
                <option value="보통">보통</option>
                <option value="낮음">낮음</option>
              </select>
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value as ServiceType | 'all')}
                className="text-sm font-medium text-gray-700 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              >
                <option value="all">모든 서비스유형</option>
                <option value="OEM">OEM</option>
                <option value="ODM">ODM</option>
                <option value="OBM">OBM</option>
                <option value="Private Label">Private Label</option>
                <option value="White Label">White Label</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="px-6 mt-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="text-base font-medium text-gray-700">프로젝트 상태:</span>
              <div className="flex gap-6">
                {(['시작전', '진행중', '완료', '중단'] as ProjectStatus[]).map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                      checked={statusFilters.includes(status)}
                      onChange={() => handleStatusFilterChange(status)}
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">기간</span>
              <input 
                type="date" 
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm" 
                defaultValue="2024-01-01" 
              />
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="px-6 py-4 flex justify-end gap-3">
        <button 
          onClick={handleSendEmail}
          className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-sm font-medium text-gray-700 rounded-xl transition-all shadow-sm flex items-center gap-2 hover:shadow-md"
        >
          <Mail className="w-4 h-4" />
          메일 보내기
        </button>
        <button 
          onClick={handleCreateProject}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          프로젝트 생성
        </button>
      </div>

      {/* 테이블 */}
      <div className="px-6 pb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="w-12 px-3 py-3">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedRows.length === sortedAndFilteredProjects.length && sortedAndFilteredProjects.length > 0}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                    />
                  </th>
                  <SortableHeader field="productType">제품타입</SortableHeader>
                  <SortableHeader field="serviceType">서비스유형</SortableHeader>
                  <th className="text-left px-4 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">현재단계</th>
                  <SortableHeader field="status">상태</SortableHeader>
                  <SortableHeader field="progress">진행률</SortableHeader>
                  <SortableHeader field="client">고객명</SortableHeader>
                  <SortableHeader field="startDate">시작일</SortableHeader>
                  <SortableHeader field="endDate">마감일</SortableHeader>
                  <SortableHeader field="manufacturer">제조</SortableHeader>
                  <SortableHeader field="container">용기</SortableHeader>
                  <SortableHeader field="packaging">포장</SortableHeader>
                  <SortableHeader field="sales">매출</SortableHeader>
                  <SortableHeader field="purchase">매입</SortableHeader>
                  <SortableHeader field="priority">우선순위</SortableHeader>
                  <th className="w-14"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedAndFilteredProjects.map((project, index) => (
                  <tr 
                    key={project.id} 
                    className={`hover:bg-blue-50/50 transition-all duration-200 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                    onClick={(e) => {
                      // Check if clicked element is interactive or an inline-editable field
                      const target = e.target as HTMLElement;
                      const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
                      if (!isInteractive) {
                        setSelectedProject(project);
                      }
                    }}
                  >
                    <td className="px-3 py-4">
                      <input 
                        type="checkbox"
                        checked={selectedRows.includes(project.id)}
                        onChange={() => handleSelectRow(project.id)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                      />
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-base text-gray-900 truncate max-w-[150px]" title={project.productType}>
                        {project.productType}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative inline-flex items-center group">
                        <select
                          value={project.serviceType}
                          onChange={(e) => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, serviceType: e.target.value as ServiceType} : p
                            );
                            setProjects(updatedProjects);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="pl-4 pr-4 group-hover:pr-9 py-1.5 text-sm font-semibold text-center rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 cursor-pointer appearance-none transition-all duration-200 hover:shadow-sm hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 whitespace-nowrap"
                        >
                          <option value="OEM">OEM</option>
                          <option value="ODM">ODM</option>
                          <option value="OBM">OBM</option>
                          <option value="Private Label">Private Label</option>
                          <option value="White Label">White Label</option>
                          <option value="기타">기타</option>
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-1 overflow-x-auto whitespace-nowrap">
                        {project.currentStage.length > 0 ? (
                          project.currentStage.map((stage, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 whitespace-nowrap">
                              {stage}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative inline-flex items-center group">
                        <select
                          value={project.status}
                          onChange={(e) => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, status: e.target.value as ProjectStatus} : p
                            );
                            setProjects(updatedProjects);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`pl-4 pr-4 group-hover:pr-9 py-1.5 text-sm font-semibold text-center rounded-lg border cursor-pointer appearance-none transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            project.status === '진행중' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 hover:border-green-300 focus:ring-green-500' :
                            project.status === '완료' ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 focus:ring-gray-500' :
                            project.status === '시작전' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200 hover:border-yellow-300 focus:ring-yellow-500' :
                            project.status === '중단' ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:border-red-300 focus:ring-red-500' :
                            'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                          }`}
                        >
                          <option value="시작전">시작전</option>
                          <option value="진행중">진행중</option>
                          <option value="완료">완료</option>
                          <option value="중단">중단</option>
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke={
                              project.status === '진행중' ? '#059669' :
                              project.status === '완료' ? '#6B7280' :
                              project.status === '시작전' ? '#D97706' :
                              project.status === '중단' ? '#DC2626' :
                              '#6B7280'
                            } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative w-28 h-7 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                          style={{ width: `${project.progress}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                          {project.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 relative">
                      {editingCell?.projectId === project.id && editingCell?.field === 'client' ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value, 'client')}
                            onBlur={() => {
                              // Delay to allow clicking on suggestions
                              setTimeout(() => {
                                setEditingCell(null);
                                setSearchValue('');
                                setShowSuggestions(false);
                              }, 200);
                            }}
                            placeholder="고객명 검색..."
                            autoFocus
                            className="w-full min-w-[200px] px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {searchSuggestions.map((suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectSuggestion(suggestion, project.id, 'client');
                                  }}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="text-base text-gray-900 truncate max-w-[120px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" 
                          title={project.client}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'client'});
                            setSearchValue(project.client);
                          }}
                        >
                          {project.client}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingCell?.projectId === project.id && editingCell?.field === 'startDate' ? (
                        <input
                          type="date"
                          value={project.startDate}
                          onChange={(e) => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, startDate: e.target.value} : p
                            );
                            setProjects(updatedProjects);
                            setEditingCell(null);
                          }}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          ref={(input) => {
                            if (input && input.showPicker) {
                              setTimeout(() => {
                                try {
                                  input.showPicker();
                                } catch (e) {
                                  // Fallback for browsers that don't support showPicker
                                  input.click();
                                }
                              }, 0);
                            }
                          }}
                          className="px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div 
                          className="text-base text-gray-500 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'startDate'});
                          }}
                        >
                          {formatDate(project.startDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingCell?.projectId === project.id && editingCell?.field === 'endDate' ? (
                        <input
                          type="date"
                          value={project.endDate}
                          onChange={(e) => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, endDate: e.target.value} : p
                            );
                            setProjects(updatedProjects);
                            setEditingCell(null);
                          }}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          ref={(input) => {
                            if (input && input.showPicker) {
                              setTimeout(() => {
                                try {
                                  input.showPicker();
                                } catch (e) {
                                  // Fallback for browsers that don't support showPicker
                                  input.click();
                                }
                              }, 0);
                            }
                          }}
                          className="px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div 
                          className="text-base text-gray-500 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'endDate'});
                          }}
                        >
                          {formatDate(project.endDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 relative">
                      {editingCell?.projectId === project.id && editingCell?.field === 'manufacturer' ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value, 'factory')}
                            onBlur={() => {
                              setTimeout(() => {
                                setEditingCell(null);
                                setSearchValue('');
                                setShowSuggestions(false);
                              }, 200);
                            }}
                            placeholder="제조 공장 검색..."
                            autoFocus
                            className="w-full min-w-[200px] px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {showSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                              {searchSuggestions.map((suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectSuggestion(suggestion, project.id, 'manufacturer');
                                  }}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="text-base text-gray-900 truncate max-w-[140px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" 
                          title={project.manufacturer}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'manufacturer'});
                            setSearchValue(project.manufacturer);
                          }}
                        >
                          {project.manufacturer}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingCell?.projectId === project.id && editingCell?.field === 'container' ? (
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          onBlur={() => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, container: searchValue || project.container} : p
                            );
                            setProjects(updatedProjects);
                            setEditingCell(null);
                            setSearchValue('');
                          }}
                          autoFocus
                          className="px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          placeholder="용기 공장 검색..."
                        />
                      ) : (
                        <div 
                          className="text-base text-gray-900 truncate max-w-[140px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" 
                          title={project.container}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'container'});
                            setSearchValue(project.container);
                          }}
                        >
                          {project.container}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingCell?.projectId === project.id && editingCell?.field === 'packaging' ? (
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          onBlur={() => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, packaging: searchValue || project.packaging} : p
                            );
                            setProjects(updatedProjects);
                            setEditingCell(null);
                            setSearchValue('');
                          }}
                          autoFocus
                          className="px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                          placeholder="포장 공장 검색..."
                        />
                      ) : (
                        <div 
                          className="text-base text-gray-900 truncate max-w-[140px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" 
                          title={project.packaging}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'packaging'});
                            setSearchValue(project.packaging);
                          }}
                        >
                          {project.packaging}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingCell?.projectId === project.id && editingCell?.field === 'sales' ? (
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value.replace(/[^0-9]/g, ''))}
                          onBlur={() => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, sales: searchValue || project.sales} : p
                            );
                            setProjects(updatedProjects);
                            setEditingCell(null);
                            setSearchValue('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const updatedProjects = projects.map(p => 
                                p.id === project.id ? {...p, sales: searchValue || project.sales} : p
                              );
                              setProjects(updatedProjects);
                              setEditingCell(null);
                              setSearchValue('');
                            }
                          }}
                          autoFocus
                          className="px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[150px]"
                          placeholder="금액 입력"
                        />
                      ) : (
                        <div 
                          className="text-base text-gray-900 truncate max-w-[100px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded" 
                          title={project.sales}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCell({projectId: project.id, field: 'sales'});
                            setSearchValue(project.sales);
                          }}
                        >
                          {formatCurrency(parseInt(project.sales) || 0)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      {editingCell?.projectId === project.id && editingCell?.field === 'purchase' ? (
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value.replace(/[^0-9]/g, ''))}
                          onBlur={() => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, purchase: searchValue || project.purchase} : p
                            );
                            setProjects(updatedProjects);
                            setEditingCell(null);
                            setSearchValue('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const updatedProjects = projects.map(p => 
                                p.id === project.id ? {...p, purchase: searchValue || project.purchase} : p
                              );
                              setProjects(updatedProjects);
                              setEditingCell(null);
                              setSearchValue('');
                            }
                          }}
                          autoFocus
                          className="px-2 py-1 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-[150px]"
                          placeholder="금액 입력"
                        />
                      ) : (
                        <div 
                          className="text-base text-gray-900 truncate max-w-[100px] cursor-pointer hover:bg-gray-100 px-2 py-1 rounded js-inline-edit" 
                          title={project.purchase}
                          onClick={() => {
                            setEditingCell({projectId: project.id, field: 'purchase'});
                            setSearchValue(project.purchase);
                          }}
                        >
                          {formatCurrency(parseInt(project.purchase) || 0)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <div className="relative inline-flex items-center group">
                        <select
                          value={project.priority}
                          onChange={(e) => {
                            const updatedProjects = projects.map(p => 
                              p.id === project.id ? {...p, priority: e.target.value as '높음' | '보통' | '낮음'} : p
                            );
                            setProjects(updatedProjects);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`pl-4 pr-4 group-hover:pr-9 py-1.5 text-sm font-semibold text-center rounded-lg border cursor-pointer appearance-none transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            project.priority === '높음' ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:border-red-300 focus:ring-red-500' :
                            project.priority === '보통' ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200 hover:border-amber-300 focus:ring-amber-500' :
                            'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 focus:ring-slate-500'
                          }`}
                        >
                          <option value="높음">높음</option>
                          <option value="보통">보통</option>
                          <option value="낮음">낮음</option>
                        </select>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke={
                              project.priority === '높음' ? '#DC2626' :
                              project.priority === '보통' ? '#D97706' :
                              '#64748B'
                            } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          if (showOptionsMenu === project.id) {
                            setShowOptionsMenu(null);
                            setDropdownPosition(null);
                          } else {
                            setShowOptionsMenu(project.id);
                            // Calculate position to ensure dropdown stays within viewport
                            const dropdownWidth = 144; // w-36 = 9rem = 144px
                            
                            // Default: align dropdown's right edge with button's right edge
                            let left = rect.right - dropdownWidth;
                            
                            // Ensure dropdown doesn't go off the left edge of screen
                            if (left < 0) {
                              left = rect.left; // Align with button's left edge instead
                            }
                            
                            setDropdownPosition({
                              top: rect.bottom + 2, // Small gap below the button
                              left: left
                            });
                          }
                        }}
                        className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dropdown Menu Portal */}
      {showOptionsMenu && dropdownPosition && (
        <div 
          ref={dropdownRef}
          className="fixed w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              const project = projects.find(p => p.id === showOptionsMenu);
              if (project) {
                handleEditProject(project);
              }
            }}
            className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            수정
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('정말 삭제하시겠습니까?')) {
                const updatedProjects = projects.filter(p => p.id !== showOptionsMenu);
                setProjects(updatedProjects);
                setShowOptionsMenu(null);
                setDropdownPosition(null);
              }
            }}
            className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
          >
            삭제
          </button>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={(emailData) => {
          console.log('Email sent:', emailData);
          setShowEmailModal(false);
          setSelectedRows([]);
        }}
        availableFactories={selectedRows.length > 0 ? getSelectedFactories() : []}
      />
      
      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={handleSaveProject}
        editData={editingProject}
        mode={modalMode}
      />
    </div>
  );
  
  // If a project is selected, show KoreanScheduleUI with the project data
  if (selectedProject) {
    // Transform project factories data for KoreanScheduleUI
    const participants = projectFactories[selectedProject.id]?.map(factory => ({
      id: factory.name,
      name: factory.name,
      period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`,
      color: factory.color.replace('bg-', '').replace('-500', '')
    })) || [
      { id: selectedProject.manufacturer, name: selectedProject.manufacturer, period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`, color: 'blue' },
      { id: selectedProject.container, name: selectedProject.container, period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`, color: 'red' },
      { id: selectedProject.packaging, name: selectedProject.packaging, period: `${selectedProject.startDate} ~ ${selectedProject.endDate}`, color: 'yellow' }
    ];
    
    return (
      <KoreanScheduleUI
        participants={participants}
        startDate={selectedProject.startDate}
        endDate={selectedProject.endDate}
      />
    );
  }
  
  return (
    <div className="container-main px-6 py-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl mb-8 p-8">
        <h1 className="text-4xl font-bold text-white mb-3">프로젝트 목록</h1>
        <p className="text-white/80 text-lg">진행중인 프로젝트를 관리하고 모니터링합니다</p>
      </div>

      {/* Actions Section */}
      <div className="card mb-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="card-padded">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
              {/* Priority Filter */}
              <select 
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as typeof selectedPriority)}
                className="form-select bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 rounded-lg px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <option value="all">모든 우선순위</option>
                <option value="높음">높음</option>
                <option value="보통">보통</option>
                <option value="낮음">낮음</option>
              </select>

              {/* Service Type Filter */}
              <select 
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value as typeof selectedServiceType)}
                className="form-select bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 rounded-lg px-4 py-2.5 font-medium text-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <option value="all">모든 서비스 유형</option>
                <option value="OEM">OEM</option>
                <option value="ODM">ODM</option>
                <option value="OBM">OBM</option>
                <option value="Private Label">Private Label</option>
                <option value="White Label">White Label</option>
                <option value="기타">기타</option>
              </select>

              {/* Status Filters */}
              <div className="flex gap-2">
                {(['시작전', '진행중', '완료'] as ProjectStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilters(prev => 
                        prev.includes(status) 
                          ? prev.filter(s => s !== status)
                          : [...prev, status]
                      );
                    }}
                    className={`px-4 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all ${
                      statusFilters.includes(status)
                        ? status === '시작전' 
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          : status === '진행중'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalMode('create');
                  setEditingProject(null);
                  setShowProjectModal(true);
                }}
                className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="icon-sm" />
                프로젝트 생성
              </button>
              
              <button
                onClick={() => {
                  if (selectedRows.length === 0) {
                    alert('이메일을 보낼 공장을 선택해주세요.');
                    return;
                  }
                  setShowEmailModal(true);
                }}
                className="btn btn-secondary flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Mail className="icon-sm" />
                메일 보내기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(filteredProjects.map(p => p.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  우선순위 {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('client')}
                >
                  고객명 {sortField === 'client' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell">담당자</th>
                <th className="table-header-cell">제품유형</th>
                <th className="table-header-cell">제조</th>
                <th className="table-header-cell">용기</th>
                <th className="table-header-cell">포장</th>
                <th className="table-header-cell">서비스유형</th>
                <th className="table-header-cell">현재단계</th>
                <th className="table-header-cell">진행률</th>
                <th className="table-header-cell">상태</th>
                <th 
                  className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('startDate')}
                >
                  시작일 {sortField === 'startDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="table-header-cell cursor-pointer hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('endDate')}
                >
                  마감일 {sortField === 'endDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header-cell">매출</th>
                <th className="table-header-cell">매입</th>
                <th className="table-header-cell text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr 
                  key={project.id} 
                  className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all cursor-pointer"
                  onClick={(e) => {
                    // Check if clicked element is interactive or an inline-editable field
                    const target = e.target as HTMLElement;
                    const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
                    if (!isInteractive) {
                      setSelectedProject(project);
                    }
                  }}
                >
                  <td className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(project.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedRows([...selectedRows, project.id]);
                        } else {
                          setSelectedRows(selectedRows.filter(id => id !== project.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-4">
                    <div className="relative inline-block w-full hover-trigger">
                      <select
                        value={project.priority}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFieldUpdate(project.id, 'priority', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-center appearance-none cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                          hover:border-gray-400 hover:shadow-sm"
                      >
                        <option value="높음">높음</option>
                        <option value="보통">보통</option>
                        <option value="낮음">낮음</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-0 hover-show transition-opacity duration-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  {renderEditableCell(project, 'client', 'search')}
                  <td className="px-3 py-4 text-sm text-gray-900">{project.manager}</td>
                  <td className="px-3 py-4 text-sm text-gray-900 truncate max-w-[120px]" title={project.productType}>
                    {project.productType}
                  </td>
                  {renderEditableCell(project, 'manufacturer', 'search')}
                  {renderEditableCell(project, 'container', 'search')}
                  {renderEditableCell(project, 'packaging', 'search')}
                  <td className="px-3 py-4">
                    <div className="relative inline-block w-full hover-trigger">
                      <select
                        value={project.serviceType}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFieldUpdate(project.id, 'serviceType', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-center appearance-none cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                          hover:border-gray-400 hover:shadow-sm"
                      >
                        <option value="OEM">OEM</option>
                        <option value="ODM">ODM</option>
                        <option value="OBM">OBM</option>
                        <option value="Private Label">Private Label</option>
                        <option value="White Label">White Label</option>
                        <option value="기타">기타</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-0 hover-show transition-opacity duration-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-xs text-gray-700 truncate max-w-[120px]" title={project.currentStage.join(', ')}>
                    {project.currentStage.join(', ') || '-'}
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full shadow-sm transition-all duration-500 ease-out"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[45px]">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="relative inline-block w-full hover-trigger">
                      <select
                        value={project.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFieldUpdate(project.id, 'status', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-3 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm text-center appearance-none cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all
                          hover:border-gray-400 hover:shadow-sm"
                      >
                        <option value="시작전">시작전</option>
                        <option value="진행중">진행중</option>
                        <option value="완료">완료</option>
                        <option value="중단">중단</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none opacity-0 hover-show transition-opacity duration-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  {renderEditableCell(project, 'startDate', 'date')}
                  {renderEditableCell(project, 'endDate', 'date')}
                  {renderEditableCell(project, 'sales', 'currency')}
                  {renderEditableCell(project, 'purchase', 'currency')}
                  <td className="px-3 py-4 text-center">
                    <div className="relative inline-block">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
                          const dropdownWidth = 160; // Approximate width of dropdown
                          setDropdownPosition({
                            top: buttonRect.bottom + 2,
                            left: buttonRect.right - dropdownWidth
                          });
                          setShowOptionsMenu(showOptionsMenu === project.id ? null : project.id);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="icon-sm text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Options Menu Dropdown - Rendered at root level */}
      {showOptionsMenu && dropdownPosition && (
        <div className="fixed z-50" style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const project = projects.find(p => p.id === showOptionsMenu);
                if (project) {
                  setModalMode('edit');
                  setEditingProject(project);
                  setShowProjectModal(true);
                }
                setShowOptionsMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              수정
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
                  setProjects(projects.filter(p => p.id !== showOptionsMenu));
                }
                setShowOptionsMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal 
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSend={(emailData) => {
          console.log('Email sent:', emailData);
          setShowEmailModal(false);
          setSelectedRows([]);
        }}
        availableFactories={selectedRows.length > 0 ? getSelectedFactories() : []}
      />
      
      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSave={handleSaveProject}
        editData={editingProject}
        mode={modalMode}
      />
    </div>
  );
};

export default ProjectList;