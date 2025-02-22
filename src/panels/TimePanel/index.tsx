import classNames from 'classnames';
import * as React from 'react';
import type { DisabledTimes, IntRange, PanelSharedProps } from '../../interface';
import { createKeyDownHandler } from '../../utils/uiUtil';
import type { BodyOperationRef, TimeBodyProps } from './TimeBody';
import TimeBody from './TimeBody';
import TimeHeader from './TimeHeader';

export type SharedTimeProps<DateType> = {
  format?: string;
  showNow?: boolean;
  showHour?: boolean;
  showMinute?: boolean;
  showSecond?: boolean;
  use12Hours?: boolean;
  hourStep?: IntRange<1, 23>;
  minuteStep?: IntRange<1, 59>;
  secondStep?: IntRange<1, 59>;
  hideDisabledOptions?: boolean;
  defaultValue?: DateType;

  /** @deprecated Please use `disabledTime` instead. */
  disabledHours?: DisabledTimes['disabledHours'];
  /** @deprecated Please use `disabledTime` instead. */
  disabledMinutes?: DisabledTimes['disabledMinutes'];
  /** @deprecated Please use `disabledTime` instead. */
  disabledSeconds?: DisabledTimes['disabledSeconds'];

  disabledTime?: (date: DateType) => DisabledTimes;
};

export type TimePanelProps<DateType> = {
  format?: string;
  active?: boolean;
} & PanelSharedProps<DateType> &
  SharedTimeProps<DateType> &
  Pick<TimeBodyProps<DateType>, 'cellRender'>;

const countBoolean = (boolList: (boolean | undefined)[]) =>
  boolList.filter((bool) => bool !== false).length;

function TimePanel<DateType>(props: TimePanelProps<DateType>) {
  const {
    generateConfig,
    format = 'HH:mm:ss',
    prefixCls,
    active,
    operationRef,
    showHour,
    showMinute,
    showSecond,
    use12Hours = false,
    onSelect,
    value,
  } = props;
  const panelPrefixCls = `${prefixCls}-time-panel`;
  const bodyOperationRef = React.useRef<BodyOperationRef>();

  // ======================= Keyboard =======================
  const [activeColumnIndex, setActiveColumnIndex] = React.useState(-1);
  const columnsCount = countBoolean([showHour, showMinute, showSecond, use12Hours]);

  operationRef.current = {
    onKeyDown: (event) =>
      createKeyDownHandler(event, {
        onLeftRight: (diff) => {
          setActiveColumnIndex((activeColumnIndex + diff + columnsCount) % columnsCount);
        },
        onUpDown: (diff) => {
          if (activeColumnIndex === -1) {
            setActiveColumnIndex(0);
          } else if (bodyOperationRef.current) {
            bodyOperationRef.current.onUpDown(diff);
          }
        },
        onEnter: () => {
          onSelect(value || generateConfig.getNow(), 'key');
          setActiveColumnIndex(-1);
        },
      }),

    onBlur: () => {
      setActiveColumnIndex(-1);
    },
  };

  return (
    <div
      className={classNames(panelPrefixCls, {
        [`${panelPrefixCls}-active`]: active,
      })}
    >
      <TimeHeader {...props} format={format} prefixCls={prefixCls} />
      <TimeBody
        {...props}
        prefixCls={prefixCls}
        activeColumnIndex={activeColumnIndex}
        operationRef={bodyOperationRef}
      />
    </div>
  );
}

export default TimePanel;
