import { Button } from "@mantine/core";
import { Icon } from "@src/components/icons";
import { useForm } from "@src/hooks/app/use-form";
import { Form } from "@src/primitives/Form";
import { sleep } from "@src/utils/task";

export const FormTest = () => {
  const { control, handleSubmit, isSubmitting, getValues } = useForm();

  async function onSubmit(values: any) {
    await sleep(3000);
    await new Promise((res) => setTimeout(() => res("Some error..."), 3000));
    console.log(values);
  }

  function onFail(error: any) {
    console.log(error);
  }

  return (
    <div className="form-demo">
      <form onSubmit={handleSubmit(onSubmit, onFail)}>
        <Form.NumberInput
          controller={{
            control,
            name: "numberInput",
            // defaultValue: "numberInput",
          }}
          label="NumberInput"
        />

        <Button leftIcon={<Icon name="Close" />} type="submit" loading={isSubmitting}>
          Submit
        </Button>
      </form>
    </div>
  );
};
