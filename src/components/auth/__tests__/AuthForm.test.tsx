import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { AuthField, PasswordField } from "../AuthForm";

describe("auth placeholders", () => {
  it("shows black placeholder text only when a controlled field is empty", async () => {
    const screen = await render(
      <AuthField label="Email" placeholder="dealer@email.com" value="" />,
    );
    expect(screen.getByText("dealer@email.com", { includeHiddenElements: true }))
      .toHaveStyle({ color: "#000000" });
    await screen.rerender(
      <AuthField label="Email" placeholder="dealer@email.com" value="a@b.com" />,
    );
    expect(screen.queryByText("dealer@email.com", { includeHiddenElements: true })).toBeNull();
    await screen.rerender(
      <AuthField label="Email" placeholder="dealer@email.com" value="" />,
    );
    expect(screen.getByText("dealer@email.com", { includeHiddenElements: true })).toBeTruthy();
  });

  it("hides and restores the hint when an uncontrolled field is edited", async () => {
    const onChangeText = jest.fn();
    const screen = await render(
      <AuthField label="Email" placeholder="Email hint" onChangeText={onChangeText} />,
    );
    await fireEvent.changeText(screen.getByLabelText("Email"), "hello");
    expect(onChangeText).toHaveBeenCalledWith("hello");
    expect(screen.queryByText("Email hint", { includeHiddenElements: true })).toBeNull();
    await fireEvent.changeText(screen.getByLabelText("Email"), "");
    expect(screen.getByText("Email hint", { includeHiddenElements: true })).toBeTruthy();
  });

  it("shows black placeholder text on a secure password field", async () => {
    const screen = await render(
      <PasswordField label="Password" placeholder="Masukkan password" value=""
        visible={false} onToggleVisibility={() => {}} />,
    );
    expect(screen.getByText("Masukkan password", { includeHiddenElements: true }))
      .toHaveStyle({ color: "#000000" });
    expect(screen.getByLabelText("Password").props.secureTextEntry).toBe(true);
  });
});
