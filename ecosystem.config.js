/**
 * ecosystem.config.js — pm2 프로세스 설정 (마음토스)
 *
 * 일일 블로그 자동 발행 + 주간 키워드 풀 보강을 pm2 cron 으로 운영합니다.
 *
 * 사용법:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --env production
 *   pm2 stop  mindthos-daily-blog-publish
 *   pm2 logs  mindthos-daily-blog-publish
 *   pm2 delete mindthos-daily-blog-publish
 *
 * 사전 요구사항:
 *   npm install -g pm2
 *   pm2 install pm2-logrotate
 *   pm2 set pm2-logrotate:max_size 10M
 *   pm2 set pm2-logrotate:retain 30
 *
 * 서버 타임존이 Asia/Seoul 이면 cron 시간은 그대로 KST 로 해석됩니다.
 * 서버가 UTC 면 KST 06:00 = UTC 21:00 (전날) 로 cron 표현을 바꿔주세요.
 */

'use strict';

const path = require('path');

const PROJECT_ROOT = __dirname;

// node/npm/claude 가 ~/.local/bin (volta/fnm/n) 또는 Homebrew 에 설치된 환경 대응
// PM2 daemon 이 부팅 셸의 stale PATH 를 상속받아 npx/claude 를 못 찾는 문제 방지
const HOME = process.env.HOME || '';
const RUNTIME_PATH = [
  HOME ? `${HOME}/.local/bin` : '',
  '/opt/homebrew/bin',
  '/opt/homebrew/sbin',
  '/usr/local/bin',
  '/Applications/cmux.app/Contents/Resources/bin',
  '/usr/bin',
  '/bin',
  '/usr/sbin',
  '/sbin',
].filter(Boolean).join(':');

module.exports = {
  apps: [
    // ----------------------------------------------------------------
    // 일일 블로그 자동 발행 (매일 06:00 KST)
    // ----------------------------------------------------------------
    {
      name: 'mindthos-daily-blog-publish',

      script: path.join(PROJECT_ROOT, 'scripts/publish-blog/daily-auto-publish.sh'),
      interpreter: '/bin/bash',

      // 일일 발행 목표 — 마음토스는 전문가 타겟이라 안정성 우선으로 5개부터 시작
      // (스크립트 기본값 5 → pm2 에서 명시적으로 5 로 고정)
      args: ['--count', '5'],

      // 매일 06:00 KST (서버 TZ=Asia/Seoul 가정)
      // 서버가 UTC 면 '0 21 * * *' (전날 21:00 UTC) 로 변경
      cron_restart: '0 6 * * *',

      // 크론 모드: 완료 후 자동 재시작 X
      autorestart: false,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 5,

      // 그레이스풀 종료 대기 (발행 중 강제 종료 방지)
      kill_timeout: 600000,

      out_file:   path.join(PROJECT_ROOT, 'logs/pm2-daily-publish-out.log'),
      error_file: path.join(PROJECT_ROOT, 'logs/pm2-daily-publish-error.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: false,

      env: {
        NODE_ENV: 'development',
        TZ: 'Asia/Seoul',
        PATH: RUNTIME_PATH,
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: 'Asia/Seoul',
        PATH: RUNTIME_PATH,
      },
      time: true,
    },

    // ----------------------------------------------------------------
    // 주간 SEO 키워드 풀 보강 (매주 월 05:00 KST — 일일 발행 06:00 직전)
    // ----------------------------------------------------------------
    {
      name: 'mindthos-weekly-keyword-refresh',
      script: path.join(PROJECT_ROOT, 'scripts/publish-blog/weekly-keyword-refresh.sh'),
      interpreter: '/bin/bash',

      cron_restart: '0 5 * * 1',

      autorestart: false,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 3,
      kill_timeout: 900000,

      out_file:   path.join(PROJECT_ROOT, 'logs/pm2-keyword-refresh-out.log'),
      error_file: path.join(PROJECT_ROOT, 'logs/pm2-keyword-refresh-error.log'),
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: false,

      env: {
        NODE_ENV: 'development',
        TZ: 'Asia/Seoul',
        PATH: RUNTIME_PATH,
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: 'Asia/Seoul',
        PATH: RUNTIME_PATH,
      },
      time: true,
    },
  ],
};
