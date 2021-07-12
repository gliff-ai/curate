import { UI } from "../ui";

interface Descriptor extends Omit<PropertyDescriptor, "value"> {
  value?: (...args: unknown[]) => unknown;
}

function logTaskExecution(taskDescription: string) {
  // Logs start and end of a task (or method call).
  // Useful only for tasks that take secs.
  return function decorator(
    target: UI,
    propertyKey: string,
    descriptor: Descriptor
  ): void {
    const targetMethod = descriptor.value;

    descriptor.value = async function decoratorWrapper(...args) {
      const setTask = (this as UI).props?.setTask;

      if (typeof setTask === "function") {
        setTask({
          isLoading: true,
          description: taskDescription,
        });
      }

      const result: unknown = await targetMethod.apply(this, args);

      if (typeof setTask === "function") {
        setTask({
          isLoading: false,
          description: "",
        });
      }

      return result;
    };
  };
}

function pageLoading(
  target: UI,
  propertyKey: string,
  descriptor: Descriptor
): void {
  const targetMethod = descriptor.value;

  descriptor.value = async function decoratorWrapper(...args) {
    const setIsLoading = (this as UI).props?.setIsLoading;

    const result: unknown = await targetMethod.apply(this, args);

    if (typeof setIsLoading === "function") {
      setIsLoading(false);
    }
  };
}

export { logTaskExecution, pageLoading };
