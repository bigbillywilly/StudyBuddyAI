# Markdownlint style configuration
# frozen_string_literal: true

all
rule 'MD013', line_length: 100, ignore_code_blocks: true, tables: false
rule 'MD029', style: 'ordered' # ordered lists increment numbers
