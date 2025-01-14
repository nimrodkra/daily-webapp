import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useState,
} from 'react';
import RankProgress from './RankProgress';
import useReadingRank from '../hooks/useReadingRank';
import dynamic from 'next/dynamic';
import AuthContext from '../contexts/AuthContext';
import { STEPS_PER_RANK } from '../lib/rank';
import OnboardingContext from '../contexts/OnboardingContext';
import Rank from './Rank';
import classNames from 'classnames';
import styles from '../styles/headerRankProgress.module.css';

const RanksModal = dynamic(
  () => import(/* webpackChunkName: "ranksModal" */ './modals/RanksModal'),
);

const NewRankModal = dynamic(
  () => import(/* webpackChunkName: "newRankModal" */ './modals/NewRankModal'),
);

export default function HeaderRankProgress({
  className,
}: {
  className?: string;
}): ReactElement {
  const { user } = useContext(AuthContext);
  const { showWelcome, onboardingReady, setShowWelcome } = useContext(
    OnboardingContext,
  );
  const [showModal, setShowModal] = useState(false);

  const {
    isLoading,
    rank,
    nextRank,
    progress,
    neverShowRankModal,
    levelUp,
    confirmLevelUp,
  } = useReadingRank();

  if (isLoading) {
    return <></>;
  }

  const showRankAnimation = levelUp && neverShowRankModal;
  const closeRanksModal = () => {
    setShowModal(false);
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  return (
    <>
      {onboardingReady && (
        <button
          className={classNames(
            'flex items-center justify-center bg-theme-bg-primary cursor-pointer focus-outline',
            styles.rankButton,
            { [styles.attention]: showWelcome },
            className,
          )}
          onClick={() => setShowModal(true)}
        >
          {showWelcome ? (
            <div
              className="flex w-12 h-12 items-center justify-center bg-theme-label-primary rounded-full"
              data-testid="welcomeButton"
            >
              <Rank
                rank={1}
                style={
                  {
                    '--stop-color1': 'var(--theme-background-primary)',
                    '--stop-color2': 'var(--theme-background-primary)',
                  } as CSSProperties
                }
              />
            </div>
          ) : (
            <RankProgress
              progress={
                showRankAnimation ? STEPS_PER_RANK[nextRank - 1] : progress
              }
              rank={showRankAnimation ? nextRank : rank}
              showRankAnimation={showRankAnimation}
              fillByDefault={showRankAnimation}
              onRankAnimationFinish={() =>
                setTimeout(() => confirmLevelUp(true), 1000)
              }
            />
          )}
        </button>
      )}
      {showModal && (
        <RanksModal
          rank={rank}
          progress={progress}
          isOpen={showModal}
          onRequestClose={closeRanksModal}
        />
      )}
      {levelUp && !neverShowRankModal && (
        <NewRankModal
          rank={nextRank}
          progress={progress}
          user={user}
          isOpen={levelUp && !neverShowRankModal}
          onRequestClose={confirmLevelUp}
        />
      )}
    </>
  );
}
