import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/shared/components/ui/alert";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs";

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

// ─── Dialog ───
describe("Dialog a11y", () => {
  it("dialog aberto com titulo e descricao nao tem violacoes", async () => {
    const { baseElement } = render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusao</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover esta oferta?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive">Deletar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });

  it("dialog com trigger nao tem violacoes quando fechado", async () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Abrir modal</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modal</DialogTitle>
            <DialogDescription>Conteudo do modal</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Select ───
describe("Select a11y", () => {
  it("select com label nao tem violacoes", async () => {
    const { container } = render(
      <div>
        <Label htmlFor="status-select">Status</Label>
        <Select>
          <SelectTrigger id="status-select" aria-label="Selecionar status">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monitoring">Monitorando</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="paused">Pausado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("select desabilitado nao tem violacoes", async () => {
    const { container } = render(
      <Select disabled>
        <SelectTrigger aria-label="Selecionar vertical">
          <SelectValue placeholder="Desabilitado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="health">Saude</SelectItem>
        </SelectContent>
      </Select>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Tabs ───
describe("Tabs a11y", () => {
  it("tabs com multiplos paineis nao tem violacoes", async () => {
    const { container } = render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dominios">Dominios</TabsTrigger>
          <TabsTrigger value="trafego">Trafego</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Conteudo overview</TabsContent>
        <TabsContent value="dominios">Conteudo dominios</TabsContent>
        <TabsContent value="trafego">Conteudo trafego</TabsContent>
      </Tabs>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("tabs com tab desabilitada nao tem violacoes", async () => {
    const { container } = render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notas" disabled>Notas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Conteudo overview</TabsContent>
        <TabsContent value="notas">Conteudo notas</TabsContent>
      </Tabs>
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
