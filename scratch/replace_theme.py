import os
import re

dashboard_path = r"c:\Proyectos\Alfajores Mandrola\js\fidelidad-app\src\app\dashboard"

replacements = [
    # Backgrounds
    (r'bg-white', 'bg-[#2a1a18]'),
    (r'bg-gray-50/70', 'bg-[#1a0e0d]'),
    (r'bg-gray-50/50', 'bg-[#1a0e0d]'),
    (r'bg-gray-50', 'bg-[#1a0e0d]'),
    (r'bg-gray-100', 'bg-[#1a0e0d] border border-[#c6a96b]/10'),
    
    # Texts
    (r'text-gray-900', 'text-[#f5efe6] font-serif'),
    (r'text-gray-800', 'text-[#f5efe6]'),
    (r'text-gray-700', 'text-[#f5efe6]/80'),
    (r'text-gray-600', 'text-[#f5efe6]/70'),
    (r'text-gray-500', 'text-[#f5efe6]/60'),
    (r'text-gray-400', 'text-[#f5efe6]/40'),
    
    # Borders
    (r'border-gray-50', 'border-[#c6a96b]/10'),
    (r'border-gray-100', 'border-[#c6a96b]/20'),
    (r'border-gray-200', 'border-[#c6a96b]/30'),
    (r'border-gray-300', 'border-[#c6a96b]/40'),
    
    # Primary accent (Blue to Gold)
    (r'text-blue-600', 'text-[#c6a96b]'),
    (r'text-blue-500', 'text-[#c6a96b]'),
    (r'bg-blue-50/50', 'bg-[#c6a96b]/5'),
    (r'bg-blue-50', 'bg-[#c6a96b]/10'),
    (r'bg-blue-100', 'bg-[#c6a96b]/20'),
    (r'text-blue-800', 'text-[#c6a96b]'),
    (r'bg-blue-600', 'bg-[#c6a96b] text-[#1a0e0d]'),
    (r'hover:bg-blue-700', 'hover:bg-[#d8bd80]'),
    (r'hover:bg-gray-50', 'hover:bg-[#c6a96b]/10'),
    (r'hover:text-gray-900', 'hover:text-[#c6a96b]'),
    (r'ring-blue-500', 'ring-[#c6a96b]'),
    (r'border-blue-500', 'border-[#c6a96b]'),
    
    # Secondary accents (Icons, alerts)
    (r'text-orange-500', 'text-orange-400'),
    (r'bg-orange-50', 'bg-orange-900/30'),
    (r'text-green-500', 'text-green-400'),
    (r'bg-green-50', 'bg-green-900/30'),
    (r'text-indigo-500', 'text-indigo-400'),
    (r'bg-indigo-50', 'bg-indigo-900/30'),
    (r'text-purple-500', 'text-purple-400'),
    (r'bg-purple-50', 'bg-purple-900/30'),
]

files_to_update = [
    "ayuda/page.tsx",
    "presupuesto/page.tsx",
    "presupuesto/BudgetManager.tsx",
    "puntos/page.tsx",
    "puntos/PuntosManager.tsx",
    "clientes/page.tsx",
    "clientes/ClientManager.tsx",
    "insights/page.tsx",
    "insights/components/InsightsKpiCards.tsx",
    "insights/components/SegmentacionClientes.tsx",
    "insights/components/TopCanjesYPuntosPromocion.tsx"
]

for rel_path in files_to_update:
    file_path = os.path.join(dashboard_path, rel_path)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for old, new in replacements:
            new_content = re.sub(old, new, new_content)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {rel_path}")
    else:
        print(f"File not found: {rel_path}")

print("Done")
