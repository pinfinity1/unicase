// src/components/auth/phone-step.tsx
import { checkUserAction } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function PhoneStep({
  setStep,
  phone,
  setPhone,
  isPending,
  startTransition,
}: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11) return;

    startTransition(async () => {
      const { exists } = await checkUserAction(phone);
      setStep(exists ? "LOGIN" : "REGISTER");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 animate-in fade-in"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black">UniCase</h1>
        <p className="text-sm text-gray-400">شماره موبایل خود را وارد کنید</p>
      </div>
      <AuthField
        type="tel"
        placeholder="09123456789"
        value={phone}
        inputMode="numeric"
        pattern="^[0-9]*$"
        onChange={(e) => setPhone(e.target.value)}
        autoFocus
        required
      />
      <Button
        disabled={isPending || phone.length < 11}
        className="w-full h-14 rounded-2xl text-lg font-bold"
      >
        {isPending ? <Loader2 className="animate-spin" /> : "ادامه مسیر"}
      </Button>
    </form>
  );
}
