#!/usr/bin/env node

/**
 * 메인 폴더 구조 개편 실행 스크립트
 * 
 * 사용법:
 * node scripts/restructure-main.js [옵션]
 * 
 * 옵션:
 * --dry-run    : 실제 파일 이동 없이 시뮬레이션만 실행
 * --skip-backup: 백업 생략 (위험!)
 * --organize   : import 구문 정렬 포함
 * --force      : 확인 없이 강제 실행
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const SRC_DIR = path.join(process.cwd(), 'src');
const BACKUP_DIR = path.join(process.cwd(), 'src_backup');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase());
    });
  });
}

async function analyzeCurrentStructure() {
  console.log(colorize('\n📊 현재 폴더 구조 분석...', 'cyan'));
  
  const stats = {
    totalFiles: 0,
    totalDirs: 0,
    filesByType: {},
    topLevelDirs: []
  };
  
  async function walkDir(dir, level = 0) {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        stats.totalDirs++;
        if (level === 0) {
          stats.topLevelDirs.push(item);
        }
        await walkDir(fullPath, level + 1);
      } else {
        stats.totalFiles++;
        const ext = path.extname(item);
        stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;
      }
    }
  }
  
  await walkDir(SRC_DIR);
  
  console.log('\n현재 구조:');
  console.log(`  - 총 파일 수: ${stats.totalFiles}`);
  console.log(`  - 총 폴더 수: ${stats.totalDirs}`);
  console.log(`  - 최상위 폴더: ${stats.topLevelDirs.join(', ')}`);
  console.log('\n파일 타입별 통계:');
  Object.entries(stats.filesByType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([ext, count]) => {
      console.log(`    ${ext || '(no ext)'}: ${count} files`);
    });
  
  return stats;
}

async function showNewStructure() {
  console.log(colorize('\n🏗️  새로운 폴더 구조:', 'green'));
  console.log(`
${colorize('src/', 'blue')}
├── ${colorize('app/', 'yellow')}           (앱 설정, 라우터, 프로바이더)
│   ├── router/
│   ├── providers/
│   ├── layouts/
│   └── config/
│
├── ${colorize('modules/', 'yellow')}       (기능별 모듈 - 독립적인 기능 단위)
│   ├── projects/   (프로젝트 관리)
│   ├── factories/  (공장 관리)
│   ├── users/      (사용자 관리)
│   ├── schedule/   (일정/간트차트)
│   ├── customers/  (고객 관리)
│   ├── products/   (제품 관리)
│   └── dashboard/  (대시보드)
│
├── ${colorize('shared/', 'yellow')}        (공유 컴포넌트, 유틸, 타입)
│   ├── components/ (공통 컴포넌트)
│   ├── hooks/      (공통 훅)
│   ├── utils/      (유틸리티 함수)
│   ├── types/      (공통 타입 정의)
│   ├── constants/  (상수)
│   └── styles/     (공통 스타일)
│
├── ${colorize('core/', 'yellow')}          (핵심 비즈니스 로직)
│   ├── api/        (API 클라이언트)
│   ├── store/      (상태 관리)
│   ├── services/   (비즈니스 서비스)
│   ├── database/   (Mock DB, 데이터)
│   └── validation/ (검증 로직)
│
├── ${colorize('assets/', 'yellow')}        (정적 파일)
├── ${colorize('tests/', 'yellow')}         (테스트 파일)
└── ${colorize('misc/', 'yellow')}          (기타 파일)
`);
}

async function checkDependencies() {
  console.log(colorize('\n🔍 의존성 확인...', 'cyan'));
  
  const requiredPackages = ['glob', 'typescript'];
  const missingPackages = [];
  
  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      console.log(`  ✅ ${pkg} 설치됨`);
    } catch {
      missingPackages.push(pkg);
      console.log(`  ❌ ${pkg} 미설치`);
    }
  }
  
  if (missingPackages.length > 0) {
    console.log(colorize('\n필요한 패키지 설치 중...', 'yellow'));
    execSync(`cd flat && npm install --save-dev ${missingPackages.join(' ')}`, { stdio: 'inherit' });
  }
}

async function runRestructure(options = {}) {
  const { dryRun, skipBackup, organize, force } = options;
  
  try {
    // 1. 현재 구조 분석
    const currentStats = await analyzeCurrentStructure();
    
    // 2. 새로운 구조 표시
    await showNewStructure();
    
    // 3. 사용자 확인
    if (!force && !dryRun) {
      const answer = await promptUser(
        colorize('\n⚠️  이 작업은 전체 폴더 구조를 변경합니다. 계속하시겠습니까? (y/n): ', 'yellow')
      );
      
      if (answer !== 'y' && answer !== 'yes') {
        console.log(colorize('\n작업이 취소되었습니다.', 'red'));
        process.exit(0);
      }
    }
    
    // 4. Dry run 모드
    if (dryRun) {
      console.log(colorize('\n🔍 DRY RUN 모드 - 실제 파일은 이동하지 않습니다.', 'yellow'));
      
      // restructure 스크립트 시뮬레이션
      const restructureScript = require('./restructure-folders.cjs');
      console.log('\n예상되는 변경사항:');
      Object.entries(restructureScript.RESTRUCTURE_MAP).forEach(([newLoc, oldLocs]) => {
        console.log(`  ${oldLocs.join(', ')} -> ${colorize(newLoc, 'green')}`);
      });
      
      return;
    }
    
    // 5. 백업
    if (!skipBackup) {
      console.log(colorize('\n📦 소스 폴더 백업 중...', 'cyan'));
      if (await fs.pathExists(BACKUP_DIR)) {
        await fs.remove(BACKUP_DIR);
      }
      await fs.copy(SRC_DIR, BACKUP_DIR);
      console.log(`  ✅ 백업 완료: ${BACKUP_DIR}`);
    }
    
    // 6. 폴더 구조 변경 실행
    console.log(colorize('\n🚀 폴더 구조 변경 시작...', 'green'));
    execSync('node scripts/restructure-folders.cjs', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // 7. Import 경로 수정
    console.log(colorize('\n🔧 Import 경로 수정 중...', 'cyan'));
    const importCmd = organize 
      ? 'node scripts/fix-imports-advanced.cjs --organize'
      : 'node scripts/fix-imports-advanced.cjs';
    
    execSync(importCmd, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // 8. 결과 확인
    console.log(colorize('\n✅ 폴더 구조 개편 완료!', 'green'));
    
    // 9. 후속 작업 안내
    console.log(colorize('\n📋 후속 작업:', 'yellow'));
    console.log('  1. IDE/에디터를 재시작하세요');
    console.log('  2. TypeScript 컴파일 확인: npm run type-check');
    console.log('  3. 테스트 실행: npm test');
    console.log('  4. 개발 서버 재시작: npm run dev');
    
    if (!skipBackup) {
      console.log(colorize('\n💡 문제가 발생한 경우:', 'cyan'));
      console.log(`  백업에서 복원: cp -r ${BACKUP_DIR}/* ${SRC_DIR}/`);
    }
    
  } catch (error) {
    console.error(colorize('\n❌ 오류 발생:', 'red'), error.message);
    
    if (!skipBackup) {
      console.log(colorize('\n🔄 백업에서 복원 중...', 'yellow'));
      await fs.copy(BACKUP_DIR, SRC_DIR, { overwrite: true });
      console.log('  ✅ 복원 완료');
    }
    
    process.exit(1);
  }
}

async function main() {
  console.log(colorize('=' . repeat(60), 'cyan'));
  console.log(colorize('   폴더 구조 대대적 개편 도구', 'green'));
  console.log(colorize('=' . repeat(60), 'cyan'));
  
  // 명령행 옵션 파싱
  const options = {
    dryRun: process.argv.includes('--dry-run'),
    skipBackup: process.argv.includes('--skip-backup'),
    organize: process.argv.includes('--organize'),
    force: process.argv.includes('--force')
  };
  
  // 옵션 표시
  console.log('\n실행 옵션:');
  Object.entries(options).forEach(([key, value]) => {
    if (value) {
      console.log(`  • ${key}: ${colorize('활성화됨', 'green')}`);
    }
  });
  
  // Docker 환경에서는 의존성이 이미 설치되어 있으므로 건너뜀
  // await checkDependencies();
  
  // 실행
  await runRestructure(options);
}

// 실행
if (require.main === module) {
  main().catch(console.error);
}