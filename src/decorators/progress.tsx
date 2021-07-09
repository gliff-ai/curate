import { UserInterface } from "../ui";

interface Descriptor extends Omit<PropertyDescriptor, "value"> {
  value?: (...args: unknown[]) => unknown;
}

function logTaskExecution(taskDescription: string) {
  // Logs start and end of a task (or method call).
  // Useful only for tasks that take secs.
  return function (
    target: UserInterface,
    propertyKey: string,
    descriptor: Descriptor
  ): void {
    const targetMethod = descriptor.value;

    descriptor.value = async function (...args) {
      const setTask = (this as UserInterface).props?.setTask;

      typeof setTask === "function" &&
        setTask({
          isLoading: true,
          description: taskDescription,
        });

      const result = await targetMethod.apply(this, args);

      typeof setTask === "function" &&
        setTask({
          isLoading: false,
          description: "",
        });

      return result;
    };
  };
}

export { logTaskExecution };
