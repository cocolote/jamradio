class CreateJams < ActiveRecord::Migration
  def change
    create_table :jams do |t|
      t.string :name, null: false
      t.integer :user_id, null: false

      t.timestamps
    end
    add_index :jams, [:name, :user_id], unique: true
  end
end
