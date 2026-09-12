"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Benefit, NXT_CATEGORIES } from "@/lib/pass-data";
import { Plus, Edit2, Trash2, X, RefreshCw, Upload, Image as ImageIcon, Gift, Check } from "lucide-react";
import { useConfirmToast } from "@/components/ui/confirm-toast";

interface AdminBenefitsTabProps {
  benefits: Benefit[];
  onRefresh: () => Promise<void>;
}

export function AdminBenefitsTab({ benefits, onRefresh }: AdminBenefitsTabProps) {
  const { confirmDelete, showToast } = useConfirmToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Upload states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // Form Fields
  const [partnerName, setPartnerName] = useState("");
  const [categoryId, setCategoryId] = useState("gastronomia");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountLabel, setDiscountLabel] = useState("");
  const [minNxtLevel, setMinNxtLevel] = useState(1);
  const [partnerLocation, setPartnerLocation] = useState("São Paulo, SP");
  const [partnerLogo, setPartnerLogo] = useState("");
  const [partnerBanner, setPartnerBanner] = useState("");
  const [terms, setTerms] = useState("Apresente o QR Code no balcão ao pedir a conta.");

  const resetForm = () => {
    setEditingBenefit(null);
    setPartnerName("");
    setCategoryId("gastronomia");
    setTitle("");
    setDescription("");
    setDiscountLabel("");
    setMinNxtLevel(1);
    setPartnerLocation("São Paulo, SP");
    setPartnerLogo("");
    setPartnerBanner("");
    setTerms("Apresente o QR Code no balcão ao pedir a conta.");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Benefit) => {
    setEditingBenefit(b);
    setPartnerName(b.partnerName);
    setCategoryId(b.categoryId);
    setTitle(b.title);
    setDescription(b.description);
    setDiscountLabel(b.discountLabel);
    setMinNxtLevel(b.minNxtLevel);
    setPartnerLocation(b.partnerLocation);
    setPartnerLogo(b.partnerLogo || "");
    setPartnerBanner(b.partnerBanner || "");
    setTerms(b.terms?.join("\n") || "Apresente o QR Code no balcão.");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "logo") setIsUploadingLogo(true);
    else setIsUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", target);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (target === "logo") {
          setPartnerLogo(data.url);
        } else {
          setPartnerBanner(data.url);
        }
        setFeedback({
          type: "success",
          text: `Imagem de ${target === "logo" ? "Logo" : "Banner"} enviada com sucesso para o bucket!`,
        });
      } else {
        setFeedback({ type: "error", text: data.error || "Falha no upload da imagem." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erro no envio do arquivo." });
    } finally {
      if (target === "logo") setIsUploadingLogo(false);
      else setIsUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      partnerName,
      categoryId,
      title,
      description,
      discountLabel,
      minNxtLevel: Number(minNxtLevel),
      partnerLocation,
      partnerLogo: partnerLogo.trim() || undefined,
      partnerBanner: partnerBanner.trim() || undefined,
      terms: terms.split("\n").filter((t) => t.trim().length > 0),
    };

    try {
      const isEdit = !!editingBenefit;
      const url = "/api/admin/benefits";
      const method = isEdit ? "PUT" : "POST";
      const bodyData = isEdit ? { id: editingBenefit.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.error || "Erro ao salvar benefício." });
        return;
      }

      setFeedback({
        type: "success",
        text: isEdit ? "Benefício atualizado com sucesso!" : "Novo benefício cadastrado com sucesso!",
      });

      await onRefresh();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erro de conexão." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirmDelete({
      title: "Excluir Benefício",
      message: `Tem certeza que deseja excluir o benefício "${title}"? Essa ação não pode ser desfeita.`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/benefits?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("success", `Benefício "${title}" removido com sucesso.`);
        setFeedback({ type: "success", text: "Benefício removido com sucesso." });
        await onRefresh();
      } else {
        showToast("error", data.error || "Erro ao excluir benefício.");
        setFeedback({ type: "error", text: data.error || "Erro ao excluir benefício." });
      }
    } catch (err: any) {
      showToast("error", err.message || "Erro de conexão.");
      setFeedback({ type: "error", text: err.message || "Erro de conexão." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">Catálogo de Benefícios (Marketplace)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cadastre parceiros reais, faça upload de fotos para o bucket e gerencie ofertas do NXT PASS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground transition-colors cursor-pointer"
            title="Recarregar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] text-white text-xs font-bold font-heading tracking-wide transition-all cursor-pointer shadow-lg shadow-[#8B24F0]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Benefício</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Benefits Content: Table or Clean Empty State */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
        {benefits.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-[#8B24F0]">
              <Gift className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-heading text-foreground">Nenhum benefício cadastrado</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                O marketplace está limpo e pronto para receber suas ofertas reais. Clique abaixo para cadastrar o primeiro benefício com foto direto no bucket.
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] text-white text-xs font-bold font-heading transition-colors cursor-pointer shadow-md shadow-[#8B24F0]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Benefício</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono">
                  <th className="py-3 px-4">Parceiro & Título</th>
                  <th className="py-3 px-4">Vertical</th>
                  <th className="py-3 px-4">Desconto / Oferta</th>
                  <th className="py-3 px-4">Nível Mínimo</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {benefits.map((b) => {
                  const categoryObj = NXT_CATEGORIES.find((c) => c.id === b.categoryId);
                  return (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {b.partnerLogo ? (
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                              <Image
                                src={b.partnerLogo}
                                alt={b.partnerName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground font-mono text-[10px] shrink-0">
                              IMG
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-foreground font-heading">{b.title}</div>
                            <div className="text-[11px] text-purple-600 dark:text-[#A855F7] font-mono">{b.partnerName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-muted border border-border text-[11px] font-mono text-muted-foreground">
                          {categoryObj?.verticalCode || b.categoryId.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-[#8B24F0]/20 border border-purple-300 dark:border-[#8B24F0]/40 text-purple-700 dark:text-[#C084FC] font-mono font-bold text-[11px]">
                          {b.discountLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-muted border border-border text-foreground font-semibold">
                          LVL {b.minNxtLevel}+
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        {b.partnerLocation}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id, b.title)}
                            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30 transition-colors cursor-pointer"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Create / Edit Benefit with Storage Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-[#090A0F] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 text-left max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingBenefit ? "Editar Benefício" : "Cadastrar Novo Benefício"}
                </h3>
                <p className="text-xs text-gray-400">
                  Preencha os dados do parceiro e envie imagens para o bucket do Supabase Storage
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Nome do Parceiro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Reserva, Starbucks..."
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Vertical / Categoria *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                  >
                    {NXT_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#090A0F] text-white">
                        {cat.name} ({cat.verticalCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Título do Benefício *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 25% OFF em Toda a Linha"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Rótulo do Desconto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 25% OFF, Compre 1 Leve 2"
                    value={discountLabel}
                    onChange={(e) => setDiscountLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Nível Mínimo do Usuário</label>
                  <select
                    value={minNxtLevel}
                    onChange={(e) => setMinNxtLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-[#090A0F] text-white">
                        Level {lvl} {lvl === 1 ? "(Aberto a todos)" : "(Exclusivo)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Localização / Alcance</label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo, SP ou Online"
                    value={partnerLocation}
                    onChange={(e) => setPartnerLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">Descrição Completa</label>
                <textarea
                  rows={2}
                  placeholder="Explicação do benefício para o associado..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">Regras e Termos (1 por linha)</label>
                <textarea
                  rows={2}
                  placeholder="Válido de segunda a sexta&#10;Apresentar QR Code no caixa"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none resize-none"
                />
              </div>

              {/* STORAGE BUCKET UPLOADS */}
              <div className="p-3.5 rounded-xl bg-[#030407] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-heading text-white flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#8B24F0]" />
                    Upload de Imagens (Bucket: benefits)
                  </span>
                  <span className="text-[10px] font-mono text-[#A855F7]">Supabase Storage</span>
                </div>

                {/* Logo Upload */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-400">Logo do Parceiro (Ícone Quadrado)</label>
                  <div className="flex items-center gap-3">
                    {partnerLogo && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                        <Image src={partnerLogo} alt="Logo preview" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <label className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-[#8B24F0] text-xs font-mono text-gray-300 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#8B24F0]" />
                      <span>{isUploadingLogo ? "Enviando logo..." : partnerLogo ? "Trocar Logo" : "Selecionar Logo (JPG, PNG)"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingLogo}
                        onChange={(e) => handleFileUpload(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Banner Upload */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-400">Banner do Benefício (Capa Retangular)</label>
                  <div className="flex items-center gap-3">
                    {partnerBanner && (
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                        <Image src={partnerBanner} alt="Banner preview" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <label className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-[#8B24F0] text-xs font-mono text-gray-300 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-[#8B24F0]" />
                      <span>{isUploadingBanner ? "Enviando banner..." : partnerBanner ? "Trocar Banner" : "Selecionar Banner (JPG, PNG)"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingBanner}
                        onChange={(e) => handleFileUpload(e, "banner")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingLogo || isUploadingBanner}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] disabled:opacity-50 text-xs font-bold font-heading text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? "Salvando..." : editingBenefit ? "Salvar Alterações" : "Criar Benefício"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
