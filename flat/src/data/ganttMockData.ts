/**
 * GanttChart Mock Data
 */

import type { Project } from '../components/GanttChart/types';

export const GANTT_MOCK_PROJECTS: Project[] = [
  {
    id: "qcell",
    name: "큐셀시스템",
    color: "bg-blue-500",
    expanded: true,
    tasks: [
      {
        id: 1,
        title: "Requirements Analysis",
        projectId: "qcell",
        startDate: "2025-07-01",
        endDate: "2025-07-07",
        color: "bg-blue-400"
      },
      {
        id: 2,
        title: "Design Phase",
        projectId: "qcell",
        startDate: "2025-07-08",
        endDate: "2025-07-15",
        color: "bg-blue-600"
      },
      {
        id: 3,
        title: "Development",
        projectId: "qcell",
        startDate: "2025-07-16",
        endDate: "2025-08-05",
        color: "bg-blue-700"
      }
    ]
  },
  {
    id: "innovate",
    name: "이노베이트케어",
    color: "bg-green-500",
    expanded: false,
    tasks: [
      {
        id: 4,
        title: "Market Research",
        projectId: "innovate",
        startDate: "2025-07-03",
        endDate: "2025-07-10",
        color: "bg-green-400"
      },
      {
        id: 5,
        title: "Prototype",
        projectId: "innovate",
        startDate: "2025-07-11",
        endDate: "2025-07-25",
        color: "bg-green-600"
      }
    ]
  },
  {
    id: "biohealth",
    name: "바이오헬스케어",
    color: "bg-purple-500",
    expanded: true,
    tasks: [
      {
        id: 6,
        title: "Research",
        projectId: "biohealth",
        startDate: "2025-07-05",
        endDate: "2025-07-20",
        color: "bg-purple-400"
      },
      {
        id: 7,
        title: "Testing",
        projectId: "biohealth",
        startDate: "2025-07-21",
        endDate: "2025-08-10",
        color: "bg-purple-600"
      }
    ]
  },
  {
    id: "netmovage",
    name: "(주)네트모베이지",
    color: "bg-yellow-500",
    expanded: true,
    tasks: [
      {
        id: "net-1",
        title: "인프라 구축",
        projectId: "netmovage",
        startDate: "2025-07-19",
        endDate: "2025-07-21",
        color: "bg-yellow-400"
      },
      {
        id: "net-2",
        title: "보안 설정",
        projectId: "netmovage",
        startDate: "2025-07-20",
        endDate: "2025-07-22",
        color: "bg-yellow-500"
      },
      {
        id: "net-3",
        title: "성능 최적화",
        projectId: "netmovage",
        startDate: "2025-07-22",
        endDate: "2025-07-24",
        color: "bg-yellow-600"
      }
    ]
  },
  {
    id: "cosmoros",
    name: "주식회사 코스모로스",
    color: "bg-cyan-500",
    expanded: true,
    tasks: [
      {
        id: "cos-1",
        title: "기술 검토",
        projectId: "cosmoros",
        startDate: "2025-07-20",
        endDate: "2025-07-22",
        color: "bg-cyan-400"
      },
      {
        id: "cos-2",
        title: "프로토타입 개발",
        projectId: "cosmoros",
        startDate: "2025-07-21",
        endDate: "2025-07-24",
        color: "bg-cyan-500"
      },
      {
        id: "cos-3",
        title: "테스트 및 검증",
        projectId: "cosmoros",
        startDate: "2025-07-24",
        endDate: "2025-07-26",
        color: "bg-cyan-600"
      }
    ]
  }
];