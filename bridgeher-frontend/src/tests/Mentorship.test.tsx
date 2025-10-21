import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Mentorship from "../pages/Mentorship";

describe("Mentorship page (UI)", () => {
  test("renders English title by default and toggles to Arabic", () => {
    render(<Mentorship />);
    
    expect(screen.getByText("Mentorship Program")).toBeInTheDocument();


    const langButton = screen.getByRole("button", { name: /Arabic|الإنجليزية/i });
    fireEvent.click(langButton);

   
    expect(screen.getByText("برنامج الإرشاد")).toBeInTheDocument();
  });

  test("search input updates and mentors list renders cards", () => {
    render(<Mentorship />);
    const input = screen.getByPlaceholderText("Search mentors...");
    fireEvent.change(input, { target: { value: "Kuir" } });
    expect(input).toHaveValue("Kuir");

    
    expect(screen.getByText(/Kuir Juach|Kuir/)).toBeInTheDocument();
  });
});