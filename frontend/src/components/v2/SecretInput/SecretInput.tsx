/* eslint-disable react/no-danger */
import { forwardRef, TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

import { useToggle } from "@app/hooks";

const REGEX = /(\${([^}]+)})/g;
const replaceContentWithDot = (str: string, skipLastN: number = 0) => {
  let finalStr = "";
  const replaceUntil = str.length - skipLastN;

  for (let i = 0; i < str.length; i += 1) {
    const char = str.at(i);
    if (i < replaceUntil) {
      finalStr += char === "\n" ? "\n" : "*";
    } else {
      finalStr += char;
    }
  }
  return finalStr;
};

const syntaxHighlight = (content?: string | null, isVisible?: boolean, isImport?: boolean, isCreditCard?: boolean, isValidCreditCard?: boolean) => {
  if (isImport && !content) return "IMPORTED";
  if (content === "") return "EMPTY";
  if (!content) return "EMPTY";

  if (isCreditCard && isValidCreditCard && !isVisible) return replaceContentWithDot(content, /* uncover last 4 digits */4)
  if (!isVisible) return replaceContentWithDot(content);

  let skipNext = false;
  const formattedContent = content.split(REGEX).flatMap((el, i) => {
    const isInterpolationSyntax = el.startsWith("${") && el.endsWith("}");
    if (isInterpolationSyntax) {
      skipNext = true;
      return (
        <span className="ph-no-capture text-yellow" key={`secret-value-${i + 1}`}>
          &#36;&#123;<span className="ph-no-capture text-yellow-200/80">{el.slice(2, -1)}</span>
          &#125;
        </span>
      );
    }
    if (skipNext) {
      skipNext = false;
      return [];
    }
    return el;
  });

  // akhilmhdh: Dont remove this br. I am still clueless how this works but weirdly enough
  // when break is added a line break works properly
  return formattedContent.concat(<br key={`secret-value-${formattedContent.length + 1}`} />);
};

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value?: string | null;
  isVisible?: boolean;
  isImport?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  containerClassName?: string;
  isCreditCard?: boolean;
  isValidCreditCard?: boolean;
};

const commonClassName = "font-mono text-sm caret-white border-none outline-none w-full break-all";

export const SecretInput = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      value,
      isVisible,
      isImport,
      containerClassName,
      onBlur,
      isDisabled,
      isReadOnly,
      onFocus,
      isCreditCard = false,
      isValidCreditCard = true,
      ...props
    },
    ref
  ) => {
    const [isSecretFocused, setIsSecretFocused] = useToggle();

    return (
      <div
        className={twMerge("w-full overflow-auto rounded-md no-scrollbar", containerClassName)}
        style={{ maxHeight: `${21 * 7}px` }}
      >
        <div className="relative overflow-hidden">
          <pre aria-hidden className="m-0 ">
            <code className={`inline-block w-full  ${commonClassName}`}>
              <span style={{ whiteSpace: "break-spaces" }}>
                {syntaxHighlight(value, isVisible || isSecretFocused, isImport, isCreditCard, isValidCreditCard)}
              </span>
            </code>
          </pre>
          <textarea
            style={{ whiteSpace: "break-spaces" }}
            aria-label="secret value"
            ref={ref}
            className={`absolute inset-0 block h-full resize-none overflow-hidden bg-transparent text-transparent no-scrollbar focus:border-0 ${commonClassName}`}
            onFocus={(evt) => {
              onFocus?.(evt);
              setIsSecretFocused.on();
            }}
            disabled={isDisabled}
            spellCheck={false}
            onBlur={(evt) => {
              onBlur?.(evt);
              setIsSecretFocused.off();
            }}
            value={value || ""}
            {...props}
            readOnly={isReadOnly}
          />
        </div>
      </div>
    );
  }
);

SecretInput.displayName = "SecretInput";
