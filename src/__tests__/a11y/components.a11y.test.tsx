import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/shared/components/ui/alert";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

// ─── Button ───
describe("Button a11y", () => {
  it("botao com texto nao tem violacoes", async () => {
    const { container } = render(<Button>Salvar</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("botao desabilitado nao tem violacoes", async () => {
    const { container } = render(<Button disabled>Salvar</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("botao icon com aria-label nao tem violacoes", async () => {
    const { container } = render(
      <Button size="icon" aria-label="Fechar">X</Button>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("botao destructive nao tem violacoes", async () => {
    const { container } = render(<Button variant="destructive">Deletar</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Input ───
describe("Input a11y", () => {
  it("input com label nao tem violacoes", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="nome@exemplo.com" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("input com aria-label nao tem violacoes", async () => {
    const { container } = render(
      <Input aria-label="Buscar ofertas" type="search" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Textarea ───
describe("Textarea a11y", () => {
  it("textarea com label nao tem violacoes", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" placeholder="Adicionar notas..." />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Badge ───
describe("Badge a11y", () => {
  it("badge com texto nao tem violacoes", async () => {
    const { container } = render(<Badge>Ativo</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("badge destructive nao tem violacoes", async () => {
    const { container } = render(<Badge variant="destructive">Erro</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Alert ───
describe("Alert a11y", () => {
  it("alert com titulo e descricao nao tem violacoes", async () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Aviso</AlertTitle>
        <AlertDescription>Operacao concluida com sucesso.</AlertDescription>
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("alert destructive nao tem violacoes", async () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Algo deu errado.</AlertDescription>
      </Alert>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Composite patterns ───
describe("Composite a11y patterns", () => {
  it("form com label + input + botao nao tem violacoes", async () => {
    const { container } = render(
      <form>
        <div>
          <Label htmlFor="domain">Dominio</Label>
          <Input id="domain" type="text" placeholder="example.com" />
        </div>
        <Button type="submit">Adicionar</Button>
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("tabela simples com headers nao tem violacoes", async () => {
    const { container } = render(
      <table>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Status</th>
            <th scope="col">Trafego</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Oferta A</td>
            <td>Ativo</td>
            <td>15.000</td>
          </tr>
        </tbody>
      </table>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("grupo de botoes icon com aria-labels nao tem violacoes", async () => {
    const { container } = render(
      <div role="toolbar" aria-label="Acoes">
        <Button size="icon" aria-label="Editar">E</Button>
        <Button size="icon" aria-label="Deletar">D</Button>
        <Button size="icon" aria-label="Ver detalhes">V</Button>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
