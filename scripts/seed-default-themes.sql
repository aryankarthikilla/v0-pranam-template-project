-- Insert default themes
INSERT INTO public.themes (name, description, author_name, is_public, is_featured, theme_data) VALUES
(
  'Light Theme',
  'Clean and bright theme perfect for daytime use',
  'Pranam Team',
  true,
  true,
  '{
    "colors": {
      "background": "0 0% 100%",
      "foreground": "222.2 84% 4.9%",
      "card": "0 0% 100%",
      "card-foreground": "222.2 84% 4.9%",
      "popover": "0 0% 100%",
      "popover-foreground": "222.2 84% 4.9%",
      "primary": "221.2 83.2% 53.3%",
      "primary-foreground": "210 40% 98%",
      "secondary": "210 40% 96%",
      "secondary-foreground": "222.2 47.4% 11.2%",
      "muted": "210 40% 96%",
      "muted-foreground": "215.4 16.3% 46.9%",
      "accent": "210 40% 96%",
      "accent-foreground": "222.2 47.4% 11.2%",
      "destructive": "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      "border": "214.3 31.8% 91.4%",
      "input": "214.3 31.8% 91.4%",
      "ring": "221.2 83.2% 53.3%"
    },
    "components": {
      "button": {
        "borderRadius": "0.5rem",
        "fontSize": "0.875rem",
        "fontWeight": "500",
        "padding": "0.5rem 1rem"
      },
      "input": {
        "borderRadius": "0.375rem",
        "borderWidth": "1px",
        "fontSize": "0.875rem",
        "padding": "0.5rem 0.75rem"
      },
      "card": {
        "borderRadius": "0.5rem",
        "borderWidth": "1px",
        "padding": "1.5rem"
      }
    }
  }'
),
(
  'Dark Theme',
  'Elegant dark theme for comfortable night-time usage',
  'Pranam Team',
  true,
  true,
  '{
    "colors": {
      "background": "222.2 84% 4.9%",
      "foreground": "210 40% 98%",
      "card": "222.2 84% 4.9%",
      "card-foreground": "210 40% 98%",
      "popover": "222.2 84% 4.9%",
      "popover-foreground": "210 40% 98%",
      "primary": "217.2 91.2% 59.8%",
      "primary-foreground": "222.2 47.4% 11.2%",
      "secondary": "217.2 32.6% 17.5%",
      "secondary-foreground": "210 40% 98%",
      "muted": "217.2 32.6% 17.5%",
      "muted-foreground": "215 20.2% 65.1%",
      "accent": "217.2 32.6% 17.5%",
      "accent-foreground": "210 40% 98%",
      "destructive": "0 62.8% 30.6%",
      "destructive-foreground": "210 40% 98%",
      "border": "217.2 32.6% 17.5%",
      "input": "217.2 32.6% 17.5%",
      "ring": "224.3 76.3% 94.1%"
    },
    "components": {
      "button": {
        "borderRadius": "0.5rem",
        "fontSize": "0.875rem",
        "fontWeight": "500",
        "padding": "0.5rem 1rem"
      },
      "input": {
        "borderRadius": "0.375rem",
        "borderWidth": "1px",
        "fontSize": "0.875rem",
        "padding": "0.5rem 0.75rem"
      },
      "card": {
        "borderRadius": "0.5rem",
        "borderWidth": "1px",
        "padding": "1.5rem"
      }
    }
  }'
),
(
  'Pink Theme',
  'Beautiful pink theme with warm and friendly vibes',
  'Pranam Team',
  true,
  true,
  '{
    "colors": {
      "background": "0 0% 100%",
      "foreground": "222.2 84% 4.9%",
      "card": "0 0% 100%",
      "card-foreground": "222.2 84% 4.9%",
      "popover": "0 0% 100%",
      "popover-foreground": "222.2 84% 4.9%",
      "primary": "322.2 78% 55%",
      "primary-foreground": "210 40% 98%",
      "secondary": "322 20% 96%",
      "secondary-foreground": "222.2 47.4% 11.2%",
      "muted": "322 20% 96%",
      "muted-foreground": "215.4 16.3% 46.9%",
      "accent": "322 20% 96%",
      "accent-foreground": "222.2 47.4% 11.2%",
      "destructive": "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      "border": "322 31.8% 91.4%",
      "input": "322 31.8% 91.4%",
      "ring": "322.2 78% 55%"
    },
    "components": {
      "button": {
        "borderRadius": "0.75rem",
        "fontSize": "0.875rem",
        "fontWeight": "600",
        "padding": "0.625rem 1.25rem"
      },
      "input": {
        "borderRadius": "0.5rem",
        "borderWidth": "2px",
        "fontSize": "0.875rem",
        "padding": "0.625rem 1rem"
      },
      "card": {
        "borderRadius": "0.75rem",
        "borderWidth": "1px",
        "padding": "2rem"
      }
    }
  }'
),
(
  'Purple Theme',
  'Mystical purple theme for creative and artistic interfaces',
  'Pranam Team',
  true,
  true,
  '{
    "colors": {
      "background": "0 0% 100%",
      "foreground": "222.2 84% 4.9%",
      "card": "0 0% 100%",
      "card-foreground": "222.2 84% 4.9%",
      "popover": "0 0% 100%",
      "popover-foreground": "222.2 84% 4.9%",
      "primary": "262.1 83.3% 57.8%",
      "primary-foreground": "210 40% 98%",
      "secondary": "262 20% 96%",
      "secondary-foreground": "222.2 47.4% 11.2%",
      "muted": "262 20% 96%",
      "muted-foreground": "215.4 16.3% 46.9%",
      "accent": "262 20% 96%",
      "accent-foreground": "222.2 47.4% 11.2%",
      "destructive": "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      "border": "262 31.8% 91.4%",
      "input": "262 31.8% 91.4%",
      "ring": "262.1 83.3% 57.8%"
    },
    "components": {
      "button": {
        "borderRadius": "0.5rem",
        "fontSize": "0.875rem",
        "fontWeight": "500",
        "padding": "0.5rem 1rem"
      },
      "input": {
        "borderRadius": "0.375rem",
        "borderWidth": "1px",
        "fontSize": "0.875rem",
        "padding": "0.5rem 0.75rem"
      },
      "card": {
        "borderRadius": "0.5rem",
        "borderWidth": "1px",
        "padding": "1.5rem"
      }
    }
  }'
),
(
  'Green Theme',
  'Fresh green theme inspired by nature and growth',
  'Pranam Team',
  true,
  true,
  '{
    "colors": {
      "background": "0 0% 100%",
      "foreground": "222.2 84% 4.9%",
      "card": "0 0% 100%",
      "card-foreground": "222.2 84% 4.9%",
      "popover": "0 0% 100%",
      "popover-foreground": "222.2 84% 4.9%",
      "primary": "142.1 76.2% 36.3%",
      "primary-foreground": "210 40% 98%",
      "secondary": "142 20% 96%",
      "secondary-foreground": "222.2 47.4% 11.2%",
      "muted": "142 20% 96%",
      "muted-foreground": "215.4 16.3% 46.9%",
      "accent": "142 20% 96%",
      "accent-foreground": "222.2 47.4% 11.2%",
      "destructive": "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      "border": "142 31.8% 91.4%",
      "input": "142 31.8% 91.4%",
      "ring": "142.1 76.2% 36.3%"
    },
    "components": {
      "button": {
        "borderRadius": "0.5rem",
        "fontSize": "0.875rem",
        "fontWeight": "500",
        "padding": "0.5rem 1rem"
      },
      "input": {
        "borderRadius": "0.375rem",
        "borderWidth": "1px",
        "fontSize": "0.875rem",
        "padding": "0.5rem 0.75rem"
      },
      "card": {
        "borderRadius": "0.5rem",
        "borderWidth": "1px",
        "padding": "1.5rem"
      }
    }
  }'
);
