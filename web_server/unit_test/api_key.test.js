import {
  generateTimeNow,
  generateTimeSevenDaysLater,
  generateTime365DaysLater,
} from "../server/model/api_key_model.js";

it("check generateTimeNow function value anｑ format is correct （１） ", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("20 Aug 2020 02:12:00 GMT").getTime());
  expect(generateTimeNow()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  expect(generateTimeNow()).toBe("2020-08-20 10:12:00");
  jest.useRealTimers();
});

it("check generateTimeNow function value and format is correct （２）", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("14 May 2023 06:30:13 GMT").getTime());
  expect(generateTimeNow()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  expect(generateTimeNow()).toBe("2023-05-14 14:30:13");
  jest.useRealTimers();
});

it("check generateTimeSevenDaysLater function value and format is correct （１） ", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("20 Aug 2020 02:12:00 GMT").getTime());
  expect(generateTimeSevenDaysLater()).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  );
  expect(generateTimeSevenDaysLater()).toBe("2020-08-27 10:12:00");
  jest.useRealTimers();
});
it("check generateTimeSevenDaysLater function value and format is correct （２）", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("14 May 2023 06:30:13 GMT").getTime());
  expect(generateTimeSevenDaysLater()).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  );
  expect(generateTimeSevenDaysLater()).toBe("2023-05-21 14:30:13");
  jest.useRealTimers();
});

it("check generateTime365DaysLater function value and format is correct （１） ", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("20 Aug 2020 02:12:00 GMT").getTime());
  expect(generateTime365DaysLater()).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  );
  expect(generateTime365DaysLater()).toBe("2021-08-20 10:12:00");
  jest.useRealTimers();
});
it("check generateTime365DaysLater function value and format is correct （２）", () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("14 May 2023 06:30:13 GMT").getTime());
  expect(generateTime365DaysLater()).toMatch(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
  );
  expect(generateTime365DaysLater()).toBe("2024-05-13 14:30:13");
  jest.useRealTimers();
});
