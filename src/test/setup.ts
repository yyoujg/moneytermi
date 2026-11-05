import '@testing-library/jest-dom';
import { MotionGlobalConfig } from 'motion/react';

// 테스트에선 애니메이션 없이 최종 상태로 바로 그린다
MotionGlobalConfig.skipAnimations = true;
