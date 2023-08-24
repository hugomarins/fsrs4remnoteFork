import { SchedulerParam } from './consts';

export const defaultParameters = {
  [SchedulerParam.Weights]: {
    id: SchedulerParam.Weights,
    title: SchedulerParam.Weights,
    defaultValue: "1, 3, 4.1, -1.5, -1.5, 0.2, 0.25, -0.41, 9.3, 1.2, -0.2, 0.5, 9.3",
    description: "Set the weights that would allow the desired behavior, as you can anticipate in Geogebra (https://www.geogebra.org/calculator/qdgnh2ab). Weights meanings explained in READ ME.",
    type: 'string' as const,
    validators: [
      {
        type: "regex" as const,
        arg: '^-?\\d+\\.?\\d*(?:, -?\\d+\\.?\\d*){12}$',
      },
    ]
  },
  [SchedulerParam.RequestRetention]: {
    id: SchedulerParam.RequestRetention,
    title: SchedulerParam.RequestRetention,
    defaultValue: 0.9,
    description: "Represents the probability of recall you want to target. Note that there is a tradeoff between higher retention and higher number of repetitions. It is recommended that you set this value somewhere between 0.8 and 0.9.",
    type: 'number' as const,
    validators: [
      {
        type: "gte" as const,
        arg: 0,
      },
      {
        type: "lte" as const,
        arg: 1,
      }
    ]
  },
  [SchedulerParam.EnableFuzz]: {
    id: SchedulerParam.EnableFuzz,
    title: SchedulerParam.EnableFuzz,
    defaultValue: true,
    description: "When enabled this adds a small random delay to new intervals to prevent cards from sticking together and always coming up for review on the same day.",
    type: 'boolean' as const,
  },
  [SchedulerParam.MaximumInterval]: {
    id: SchedulerParam.MaximumInterval,
    title: SchedulerParam.MaximumInterval,
    defaultValue: 36500,
    description: "The maximum number of days between repetitions.",
    type: 'number' as const,
    validators: [
      {
        type: "int" as const
      },
      {
        type: "gte" as const,
        arg: 0,
      },
    ]
  },
  [SchedulerParam.EasyBonus]: {
    id: SchedulerParam.EasyBonus,
    title: SchedulerParam.EasyBonus,
    defaultValue: 1.3,
    description: "An extra multiplier applied to the interval when a review card is answered Easy.",
    type: 'number' as const,
    validators: [
      {
        type: "gte" as const,
        arg: 0,
      },
    ]
  },
  [SchedulerParam.HardInterval]: {
    id: SchedulerParam.HardInterval,
    title: SchedulerParam.HardInterval,
    defaultValue: 1.2,
    description: "",
    type: 'number' as const,
    validators: [
      {
        type: "gte" as const,
        arg: 0,
      },
    ]
  },
  [SchedulerParam.AgainStep]: {
    id: SchedulerParam.AgainStep,
    title: SchedulerParam.AgainStep,
    defaultValue: 1,
    description: "Delay (in MINUTES) that will be used when you press the Again button on a new card. The card will be shown again after this delay, and if you pass, the card will receive the initial Stability set in w0. The delay set here will also be used to 'relearn' when you fail a review card.",
    type: 'number' as const,
    validators: [
      {
        type: "int" as const
      },
      {
        type: "gte" as const,
        arg: 0,
      },
    ]
  },
  [SchedulerParam.HardStep]: {
    id: SchedulerParam.HardStep,
    title: SchedulerParam.HardStep,
    defaultValue: 10,
    description: "Delay (in MINUTES) that will be used when you press the Hard button on a new card. The card will be shown again after this delay, and if you pass, the card will receive as initial Stability w0 + w1.",
    type: 'number' as const,
    validators: [
      {
        type: "int" as const
      },
      {
        type: "gte" as const,
        arg: 0,
      },
    ]
  },
  [SchedulerParam.GoodStep]: {
    id: SchedulerParam.GoodStep,
    title: SchedulerParam.GoodStep,
    defaultValue: 1440,
    description: "Delay (in MINUTES) that will be used when you press the Good button on a new card. The card will be shown again after this delay, and if you pass, the card will receive as initial Stability w0 + (2 x w1).",
    type: 'number' as const,
    validators: [
      {
        type: "int" as const
      },
      {
        type: "gte" as const,
        arg: 0,
      },
    ]
  }
};

type DefaultParameterRecord = typeof defaultParameters

export type SchedulerParameterTypes = {
  [Param in keyof typeof defaultParameters]: DefaultParameterRecord[Param]["defaultValue"]
}
