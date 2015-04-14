class CreateRadios < ActiveRecord::Migration
  def change
    create_table :radios do |t|
      t.string :name, null: false
      t.string :category, null: false

      t.timestamps null: false
    end
    add_index :radios, [:name, :category], unique: true
  end
end
